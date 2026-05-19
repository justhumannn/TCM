-- ============================================================
-- TCM (Talk-to-Calendar Manager) — Supabase Schema
-- ============================================================
-- 실행 순서: Supabase Dashboard → SQL Editor → 아래 전체 붙여넣기 후 Run

-- UUID 확장 활성화
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. users — 앱 사용자 프로필 (auth.users 확장)
-- ============================================================
create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  email           text not null unique,
  kakao_id        text,                        -- 카카오 OAuth ID
  kakao_connected boolean not null default false,
  google_calendar_connected boolean not null default false,
  ai_sensitivity  text not null default 'high'
                  check (ai_sensitivity in ('low', 'medium', 'high')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.users is '앱 사용자 프로필. auth.users와 1:1 연결.';

-- ============================================================
-- 2. monitored_rooms — 모니터링 중인 카카오톡 채팅방
-- ============================================================
create table public.monitored_rooms (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  room_name       text not null,
  participant_count integer not null default 2,
  is_active       boolean not null default true,
  kakao_room_id   text,                        -- 카카오 API에서 받는 실제 방 ID
  created_at      timestamptz not null default now()
);
comment on table public.monitored_rooms is '사용자가 AI 모니터링 대상으로 지정한 카카오톡 채팅방.';

create index idx_monitored_rooms_user_id on public.monitored_rooms(user_id);

-- ============================================================
-- 3. chat_messages — 원본 채팅 메시지 (감지 근거)
-- ============================================================
create table public.chat_messages (
  id              uuid primary key default uuid_generate_v4(),
  room_id         uuid not null references public.monitored_rooms(id) on delete cascade,
  sender_name     text not null,
  message_text    text not null,
  sent_at         timestamptz not null,
  highlights      jsonb,                       -- AI가 하이라이트한 키워드 배열 ["강남역", "오후 7시"]
  created_at      timestamptz not null default now()
);
comment on table public.chat_messages is '감지된 약속의 근거가 된 원본 채팅 메시지.';

create index idx_chat_messages_room_id on public.chat_messages(room_id);

-- ============================================================
-- 4. detected_events — AI가 감지한 약속 후보
-- ============================================================
create table public.detected_events (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  room_id             uuid references public.monitored_rooms(id) on delete set null,
  ai_confidence       numeric(4,3) not null check (ai_confidence between 0 and 1),
                                               -- 예: 0.94 → 94%
  status              text not null default 'pending'
                      check (status in ('pending', 'saved', 'dismissed')),

  -- AI 추출 결과
  extracted_title     text,
  extracted_date      date,
  extracted_time      time,
  extracted_location  text,
  extracted_participants jsonb,                -- ["김민준", "이서연", "박지훈"]
  extracted_purpose   text,

  detected_at         timestamptz not null default now(),
  reviewed_at         timestamptz                          -- 사용자가 확인한 시각
);
comment on table public.detected_events is 'AI가 채팅방에서 감지한 약속 후보. 사용자 확인 전 임시 보관.';

create index idx_detected_events_user_id  on public.detected_events(user_id);
create index idx_detected_events_status   on public.detected_events(status);
create index idx_detected_events_detected on public.detected_events(detected_at desc);

-- 메시지 ↔ 감지 이벤트 N:M 연결 테이블
create table public.detected_event_messages (
  detected_event_id uuid not null references public.detected_events(id) on delete cascade,
  chat_message_id   uuid not null references public.chat_messages(id) on delete cascade,
  primary key (detected_event_id, chat_message_id)
);

-- ============================================================
-- 5. calendar_events — 확정 저장된 캘린더 일정
-- ============================================================
create table public.calendar_events (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  detected_event_id   uuid references public.detected_events(id) on delete set null,

  title               text not null,
  event_date          date not null,
  event_time          time,
  location            text,
  participants        jsonb,                   -- ["김민준", "이서연"]
  purpose             text,
  memo                text,

  is_ai_generated     boolean not null default false,
  importance          text not null default 'normal'
                      check (importance in ('normal', 'important', 'very_important')),

  -- Google Calendar 연동
  google_event_id     text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.calendar_events is '사용자가 최종 저장한 캘린더 일정.';

create index idx_calendar_events_user_id   on public.calendar_events(user_id);
create index idx_calendar_events_event_date on public.calendar_events(event_date);

-- ============================================================
-- 6. event_alerts — 일정별 알림 설정
-- ============================================================
create table public.event_alerts (
  id                  uuid primary key default uuid_generate_v4(),
  event_id            uuid not null references public.calendar_events(id) on delete cascade,
  minutes_before      integer not null check (minutes_before > 0),
                                               -- 15 / 30 / 45 / 60
  is_enabled          boolean not null default true,
  created_at          timestamptz not null default now()
);
comment on table public.event_alerts is '각 캘린더 일정의 버퍼 알림 설정.';

create index idx_event_alerts_event_id on public.event_alerts(event_id);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS) — 본인 데이터만 접근 가능
-- ============================================================
alter table public.users               enable row level security;
alter table public.monitored_rooms     enable row level security;
alter table public.chat_messages       enable row level security;
alter table public.detected_events     enable row level security;
alter table public.detected_event_messages enable row level security;
alter table public.calendar_events     enable row level security;
alter table public.event_alerts        enable row level security;

-- users
create policy "users: 본인만 조회"   on public.users for select using (auth.uid() = id);
create policy "users: 본인만 수정"   on public.users for update using (auth.uid() = id);
create policy "users: 가입 시 생성"  on public.users for insert with check (auth.uid() = id);

-- monitored_rooms
create policy "rooms: 본인만 접근" on public.monitored_rooms
  for all using (auth.uid() = user_id);

-- chat_messages (room 소유자만 접근)
create policy "messages: 본인 방만 접근" on public.chat_messages
  for all using (
    exists (
      select 1 from public.monitored_rooms r
      where r.id = chat_messages.room_id and r.user_id = auth.uid()
    )
  );

-- detected_events
create policy "detected: 본인만 접근" on public.detected_events
  for all using (auth.uid() = user_id);

-- detected_event_messages
create policy "det_msg: 본인만 접근" on public.detected_event_messages
  for all using (
    exists (
      select 1 from public.detected_events de
      where de.id = detected_event_messages.detected_event_id and de.user_id = auth.uid()
    )
  );

-- calendar_events
create policy "events: 본인만 접근" on public.calendar_events
  for all using (auth.uid() = user_id);

-- event_alerts
create policy "alerts: 본인만 접근" on public.event_alerts
  for all using (
    exists (
      select 1 from public.calendar_events ce
      where ce.id = event_alerts.event_id and ce.user_id = auth.uid()
    )
  );

-- ============================================================
-- 신규 사용자 가입 시 users 레코드 자동 생성 트리거
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 샘플 데이터 (개발 테스트용 — 프로덕션에서는 삭제)
-- ============================================================
-- 주의: 아래는 실제 auth.users에 계정이 있을 때만 동작합니다.
-- Supabase Auth로 회원가입 후 해당 UUID를 넣어야 합니다.

-- insert into public.monitored_rooms (user_id, room_name, participant_count) values
--   ('<your-user-uuid>', '대학 동기 단톡방', 6),
--   ('<your-user-uuid>', '팀 프로젝트',      4);

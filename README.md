# TCM — Talk-to-Calendar Manager

카카오톡 대화를 AI가 분석해 일정을 자동으로 캘린더에 저장하는 모바일 앱 디자인 시스템 및 프로토타입입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| UI 컴포넌트 | shadcn/ui + Radix UI |
| 아이콘 | Phosphor Icons |
| 백엔드 / DB | Supabase (PostgreSQL + Auth + RLS) |
| 배포 | Vercel |

---

## 화면 구성 (6 Screens)

| # | 화면 | 설명 |
|---|------|------|
| 1 | Splash | 온보딩 |
| 2 | Home Dashboard | AI 모니터링 상태, 최근 감지된 약속 |
| 3 | Detection Sheet | AI 약속 감지 알림 (채팅 미리보기 + 분석 결과) |
| 4 | Calendar View | 월간 캘린더 (AI/수동 구분) |
| 5 | Event Detail | 일정 상세 편집, 버퍼 알림 설정 |
| 6 | Settings | 카카오톡/구글 캘린더 연동, AI 민감도 |

---

## 로컬 실행 방법

### 1단계 — 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/your-username/tcm-app-design.git
cd tcm-app-design
pnpm install
```

### 2단계 — Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 → **New Project** 생성
2. 프로젝트 이름: `tcm-app` / 비밀번호: 강력한 비밀번호 설정
3. 리전: `Northeast Asia (Seoul)` 선택 → **Create new project**

### 3단계 — 데이터베이스 스키마 적용

Supabase Dashboard → 좌측 메뉴 **SQL Editor** → **New query** 클릭

`supabase/schema.sql` 파일의 전체 내용을 붙여넣고 **Run** (또는 `Cmd+Enter`) 실행

> 성공 시 "Success. No rows returned" 메시지 확인

### 4단계 — 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 Supabase 값 입력:

```
# Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**키 찾는 법:** Supabase Dashboard → 좌측 하단 **Settings** → **API** 탭
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5단계 — 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 — 6개 화면이 나란히 보임

---

## Supabase 테이블 구조

```
auth.users (Supabase 기본 제공)
    │
    ▼
users                  ← 사용자 프로필 (auth.users 확장)
    │
    ├── monitored_rooms    ← 모니터링 카카오톡 채팅방
    │       │
    │       └── chat_messages  ← 원본 채팅 메시지
    │               │
    │               └── detected_event_messages  ← N:M 연결
    │                       │
    ├── detected_events ◄───┘   ← AI 감지 약속 후보
    │
    └── calendar_events    ← 확정 저장된 일정
            │
            └── event_alerts   ← 버퍼 알림 설정
```

### 주요 설계 결정

- **RLS(Row Level Security) 전면 활성화** — 모든 테이블에서 `auth.uid() = user_id` 조건으로 본인 데이터만 접근 가능
- **`detected_events` → `calendar_events` 분리** — AI 감지(임시)와 확정 저장을 분리해 사용자 확인 전 데이터 보관
- **`detected_event_messages` N:M** — 하나의 감지 이벤트가 여러 채팅 메시지에 걸쳐 있을 수 있어 중간 테이블로 연결
- **`updated_at` 자동 갱신 트리거** — `users`, `calendar_events` 수정 시 자동 갱신

---

## 프로젝트 구조

```
tcm-app-design/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (Pretendard 폰트, Analytics)
│   ├── page.tsx            # 디자인 핸드오프 뷰어 (6 화면 나란히 표시)
│   └── globals.css
├── components/
│   ├── tcm/                # TCM 앱 전용 화면 컴포넌트
│   │   ├── shared.tsx      # 공통 (BottomNav, Avatar, EventDetectionCard...)
│   │   ├── SplashScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DetectionSheet.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── EventDetailScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── ui/                 # shadcn/ui 범용 컴포넌트
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트 + 쿼리 헬퍼
│   ├── types/
│   │   └── database.ts     # DB 테이블 TypeScript 타입
│   └── utils.ts
├── supabase/
│   └── schema.sql          # 전체 DB 스키마 (여기서 시작!)
├── hooks/
│   └── use-mobile.ts
├── public/
├── .env.local.example      # 환경변수 템플릿
└── README.md
```

---

## Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수는 Vercel Dashboard → Settings → Environment Variables 에서 추가
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 라이선스

MIT

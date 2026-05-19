import { createClient } from '@supabase/supabase-js'
import type { CalendarEvent, DetectedEvent } from './types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[TCM] Supabase 환경 변수 없음 — 목업 데이터로 동작합니다.')
}

// 브라우저/서버 양쪽에서 사용하는 싱글턴 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── 자주 쓰는 쿼리 헬퍼 ─────────────────────────────────────

/** 현재 로그인 사용자의 프로필을 가져옵니다 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

/** 사용자의 캘린더 일정 목록 (날짜 범위 필터) */
export async function getCalendarEvents(
  userId: string,
  from: string,
  to: string,
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', from)
    .lte('event_date', to)
    .order('event_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as CalendarEvent[]
}

/** pending 상태의 AI 감지 이벤트 목록 */
export async function getPendingDetectedEvents(userId: string) {
  const { data, error } = await supabase
    .from('detected_events')
    .select(`
      *,
      monitored_rooms ( room_name, participant_count ),
      detected_event_messages (
        chat_messages ( sender_name, message_text, sent_at, highlights )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('detected_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/** AI 감지 이벤트를 캘린더 일정으로 저장 */
export async function saveDetectedEventToCalendar(
  detectedEventId: string,
  userId: string,
  overrides?: {
    title?: string
    event_date?: string
    event_time?: string
    location?: string
    participants?: string[]
    memo?: string
  },
): Promise<CalendarEvent> {
  const { data: detected, error: fetchError } = await supabase
    .from('detected_events')
    .select('*')
    .eq('id', detectedEventId)
    .single()

  if (fetchError) throw fetchError

  const det = detected as DetectedEvent

  const { data: saved, error: insertError } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      detected_event_id: detectedEventId,
      title: overrides?.title ?? det.extracted_title ?? '새 일정',
      event_date: overrides?.event_date ?? det.extracted_date!,
      event_time: overrides?.event_time ?? det.extracted_time,
      location: overrides?.location ?? det.extracted_location,
      participants: overrides?.participants ?? det.extracted_participants,
      purpose: det.extracted_purpose,
      memo: overrides?.memo ?? null,
      is_ai_generated: true,
      importance: 'normal' as const,
    })
    .select()
    .single()

  if (insertError) throw insertError

  // 감지 이벤트 상태를 'saved'로 업데이트
  await supabase
    .from('detected_events')
    .update({ status: 'saved', reviewed_at: new Date().toISOString() })
    .eq('id', detectedEventId)

  return saved as CalendarEvent
}

/** 감지 이벤트 무시 처리 */
export async function dismissDetectedEvent(detectedEventId: string): Promise<void> {
  const { error } = await supabase
    .from('detected_events')
    .update({ status: 'dismissed', reviewed_at: new Date().toISOString() })
    .eq('id', detectedEventId)

  if (error) throw error
}

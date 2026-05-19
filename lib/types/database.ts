// TCM — Supabase 테이블 TypeScript 타입 정의
// supabase/schema.sql 과 1:1 대응

export type AISensitivity = 'low' | 'medium' | 'high'
export type DetectedEventStatus = 'pending' | 'saved' | 'dismissed'
export type EventImportance = 'normal' | 'important' | 'very_important'

// ── users ────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  kakao_id: string | null
  kakao_connected: boolean
  google_calendar_connected: boolean
  ai_sensitivity: AISensitivity
  created_at: string
  updated_at: string
}

// ── monitored_rooms ──────────────────────────────────────────
export interface MonitoredRoom {
  id: string
  user_id: string
  room_name: string
  participant_count: number
  is_active: boolean
  kakao_room_id: string | null
  created_at: string
}

// ── chat_messages ────────────────────────────────────────────
export interface ChatMessage {
  id: string
  room_id: string
  sender_name: string
  message_text: string
  sent_at: string
  highlights: string[] | null   // ["강남역", "오후 7시"]
  created_at: string
}

// ── detected_events ──────────────────────────────────────────
export interface DetectedEvent {
  id: string
  user_id: string
  room_id: string | null
  ai_confidence: number          // 0.000 ~ 1.000
  status: DetectedEventStatus
  extracted_title: string | null
  extracted_date: string | null  // ISO date "2025-06-03"
  extracted_time: string | null  // "19:00:00"
  extracted_location: string | null
  extracted_participants: string[] | null
  extracted_purpose: string | null
  detected_at: string
  reviewed_at: string | null
}

// ── calendar_events ──────────────────────────────────────────
export interface CalendarEvent {
  id: string
  user_id: string
  detected_event_id: string | null
  title: string
  event_date: string             // ISO date "2025-06-03"
  event_time: string | null      // "19:00:00"
  location: string | null
  participants: string[] | null
  purpose: string | null
  memo: string | null
  is_ai_generated: boolean
  importance: EventImportance
  google_event_id: string | null
  created_at: string
  updated_at: string
}

// ── event_alerts ─────────────────────────────────────────────
export interface EventAlert {
  id: string
  event_id: string
  minutes_before: number         // 15 | 30 | 45 | 60
  is_enabled: boolean
  created_at: string
}

// ── Supabase Database 루트 타입 (supabase-js v2 제너릭용) ────
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      monitored_rooms: {
        Row: MonitoredRoom
        Insert: Omit<MonitoredRoom, 'id' | 'created_at'>
        Update: Partial<Omit<MonitoredRoom, 'id' | 'user_id' | 'created_at'>>
      }
      chat_messages: {
        Row: ChatMessage
        Insert: Omit<ChatMessage, 'id' | 'created_at'>
        Update: Partial<Omit<ChatMessage, 'id' | 'room_id' | 'created_at'>>
      }
      detected_events: {
        Row: DetectedEvent
        Insert: Omit<DetectedEvent, 'id' | 'detected_at'>
        Update: Partial<Omit<DetectedEvent, 'id' | 'user_id' | 'detected_at'>>
      }
      calendar_events: {
        Row: CalendarEvent
        Insert: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      event_alerts: {
        Row: EventAlert
        Insert: Omit<EventAlert, 'id' | 'created_at'>
        Update: Partial<Omit<EventAlert, 'id' | 'event_id' | 'created_at'>>
      }
    }
  }
}

export type AISensitivity = "low" | "medium" | "high"
export type DetectedEventStatus = "pending" | "saved" | "dismissed"
export type EventImportance = "normal" | "important" | "very_important"

export interface CalendarEvent {
  id: string
  title: string
  event_date: string
  event_time: string | null
  location: string | null
  participants: string[] | null
  purpose: string | null
  memo: string | null
  is_ai_generated: boolean
  importance: EventImportance
  created_at: string
  updated_at: string
}

export interface DetectedEvent {
  id: string
  ai_confidence: number
  status: DetectedEventStatus
  extracted_title: string | null
  extracted_date: string | null
  extracted_time: string | null
  extracted_location: string | null
  extracted_participants: string[] | null
  extracted_purpose: string | null
  detected_at: string
  reviewed_at: string | null
}

export interface Settings {
  userName: string
  aiSensitivity: AISensitivity
  googleCalendarConnected: boolean
  kakaoConnected: boolean
}

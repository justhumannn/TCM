// 디자인 목업 기준 샘플 데이터
// Supabase 미연결 시 각 페이지의 기본값으로 사용됩니다.
import type { User, CalendarEvent, DetectedEvent } from "./types/database"

export const MOCK_USER: User = {
  id: "mock-user-id",
  name: "김민준",
  email: "minj@kakao.com",
  kakao_id: "kakao-123",
  kakao_connected: true,
  google_calendar_connected: true,
  ai_sensitivity: "high",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const THIS_YEAR = new Date().getFullYear()
const THIS_MONTH = String(new Date().getMonth() + 1).padStart(2, "0")

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "mock-event-1",
    user_id: "mock-user-id",
    detected_event_id: "mock-det-1",
    title: "강남역 저녁 약속",
    event_date: `${THIS_YEAR}-${THIS_MONTH}-03`,
    event_time: "19:00:00",
    location: "강남역 2번 출구",
    participants: ["김민준", "이서연", "박지훈"],
    purpose: "저녁 식사",
    memo: null,
    is_ai_generated: true,
    importance: "important",
    google_event_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mock-event-2",
    user_id: "mock-user-id",
    detected_event_id: "mock-det-2",
    title: "팀 회의",
    event_date: `${THIS_YEAR}-${THIS_MONTH}-05`,
    event_time: "10:00:00",
    location: "회사 2층 회의실",
    participants: ["김민준", "팀원1", "팀원2"],
    purpose: "프로젝트 회의",
    memo: null,
    is_ai_generated: true,
    importance: "normal",
    google_event_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const MOCK_DETECTIONS: DetectedEvent[] = [
  {
    id: "mock-det-1",
    user_id: "mock-user-id",
    room_id: null,
    ai_confidence: 0.94,
    status: "pending",
    extracted_title: "대학 동기 단톡방",
    extracted_date: `${THIS_YEAR}-${THIS_MONTH}-03`,
    extracted_time: "19:00:00",
    extracted_location: "강남역 2번 출구",
    extracted_participants: ["김민준", "이서연", "박지훈", "최수진", "한동훈", "오지현"],
    extracted_purpose: "내일 저녁 강남에서 보자 다들 가능해?",
    detected_at: new Date().toISOString(),
    reviewed_at: null,
  },
  {
    id: "mock-det-2",
    user_id: "mock-user-id",
    room_id: null,
    ai_confidence: 0.87,
    status: "pending",
    extracted_title: "팀 프로젝트",
    extracted_date: `${THIS_YEAR}-${THIS_MONTH}-05`,
    extracted_time: "10:00:00",
    extracted_location: "회사 2층 회의실",
    extracted_participants: ["김민준", "팀원1", "팀원2", "팀원3"],
    extracted_purpose: "목요일 오전 회의 가능한 사람? 장소는 회사 2층",
    detected_at: new Date().toISOString(),
    reviewed_at: null,
  },
]

export const MOCK_STATS = {
  thisWeek: 8,
  pending: 3,
  savedTotal: 21,
}

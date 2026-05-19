"use client"

// 클라이언트에서 로컬 API 라우트를 호출하는 헬퍼들

export async function getCalendarEvents(year: number, month: number) {
  const res = await fetch(`/api/events?year=${year}&month=${month}`)
  if (!res.ok) return []
  return res.json()
}

export async function getCalendarEvent(id: string) {
  const res = await fetch(`/api/events/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function createCalendarEvent(data: {
  title: string
  event_date: string
  event_time?: string | null
  location?: string | null
  memo?: string | null
  importance?: string
  is_ai_generated?: boolean
  detected_event_id?: string | null
}) {
  const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error("일정 저장 실패")
  return res.json()
}

export async function updateCalendarEvent(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error("일정 수정 실패")
  return res.json()
}

export async function deleteCalendarEvent(id: string) {
  const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("일정 삭제 실패")
}

export async function getPendingDetections() {
  const res = await fetch("/api/detections")
  if (!res.ok) return []
  return res.json()
}

export async function getDetection(id: string) {
  const res = await fetch(`/api/detections/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function createDetection(data: {
  ai_confidence?: number
  extracted_title?: string
  extracted_date?: string
  extracted_time?: string
  extracted_location?: string
  extracted_participants?: string[]
  extracted_purpose?: string
}) {
  const res = await fetch("/api/detections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error("감지 이벤트 생성 실패")
  return res.json()
}

export async function saveDetection(id: string) {
  const res = await fetch(`/api/detections/${id}/save`, { method: "POST" })
  if (!res.ok) throw new Error("저장 실패")
  return res.json()
}

export async function dismissDetection(id: string) {
  const res = await fetch(`/api/detections/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "dismissed" }) })
  if (!res.ok) throw new Error("무시 처리 실패")
}

export async function getSettings() {
  const res = await fetch("/api/settings")
  if (!res.ok) return null
  return res.json()
}

export async function updateSettings(data: Record<string, unknown>) {
  const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error("설정 저장 실패")
  return res.json()
}

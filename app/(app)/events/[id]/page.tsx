"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import {
  ArrowLeft, Sparkle, CalendarBlank, Clock, MapPin, Users,
  NotePencil, BellRinging, CaretDown, X, Trash,
} from "@phosphor-icons/react"
import { SmartAlertBadge, StatusBar } from "@/components/tcm/shared"
import { MOCK_EVENTS } from "@/lib/mock-data"
import { getCalendarEvent, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/api"
import type { CalendarEvent, EventImportance } from "@/lib/types/database"

const ALERT_OPTIONS = [15, 30, 45, 60]
const IMPORTANCE_LEVELS: { label: string; value: EventImportance; cls: string }[] = [
  { label: "일반",      value: "normal",        cls: "bg-[#F5F5F5] text-[#737373]" },
  { label: "중요",      value: "important",     cls: "bg-[#FEF9C3] text-[#A16207]" },
  { label: "매우 중요", value: "very_important", cls: "bg-[#EAB308] text-[#1A1A1A]" },
]

function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}
function fmtDate(d: string | null) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
}

export default function EventDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const isNew = id === "new"

  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [editMode, setEditMode] = useState(isNew || searchParams.get("edit") === "true")
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [memo, setMemo] = useState("")
  const [importance, setImportance] = useState<EventImportance>("normal")
  const [alertMins, setAlertMins] = useState(30)
  const [alertEnabled, setAlertEnabled] = useState(true)

  useEffect(() => {
    if (isNew) {
      const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0]
      setEvent({ id: "", user_id: "", detected_event_id: null, title: "", event_date: date, event_time: null, location: null, participants: null, purpose: null, memo: null, is_ai_generated: false, importance: "normal", google_event_id: null, created_at: "", updated_at: "" })
      return
    }

    const mock = MOCK_EVENTS.find(e => e.id === id)
    if (mock) {
      setEvent(mock); setTitle(mock.title); setLocation(mock.location ?? "")
      setMemo(mock.memo ?? ""); setImportance(mock.importance); setLoading(false); return
    }

    getCalendarEvent(id).then(data => {
      if (!data || data.error) { setError("일정을 찾을 수 없습니다"); setLoading(false); return }
      setEvent(data); setTitle(data.title); setLocation(data.location ?? "")
      setMemo(data.memo ?? ""); setImportance(data.importance); setLoading(false)
    }).catch(() => { setError("불러오기 실패"); setLoading(false) })
  }, [id, isNew, searchParams])

  async function handleSave() {
    if (!event) return
    setSaving(true); setError("")
    try {
      if (isNew) {
        await createCalendarEvent({
          title: title || "새 일정",
          event_date: event.event_date,
          event_time: event.event_time,
          location: location || null,
          memo: memo || null,
          importance,
          is_ai_generated: false,
        })
        router.replace(`/calendar?date=${event.event_date}`)
      } else {
        await updateCalendarEvent(event.id, { title: title || event.title, location: location || null, memo: memo || null, importance })
        setEvent({ ...event, title, location: location || null, memo: memo || null, importance })
        setEditMode(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다")
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!event?.id) return
    if (!confirm("정말 이 일정을 삭제하시겠어요?")) return
    setDeleting(true)
    try {
      await deleteCalendarEvent(event.id)
      router.replace("/calendar")
    } catch { setError("삭제 중 오류가 발생했습니다"); setDeleting(false) }
  }

  if (loading) return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <div className="h-11" /><StatusBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] border-t-[#EAB308] animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <div className="h-11" />
      <StatusBar />

      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
          <ArrowLeft size={16} weight="bold" className="text-[#171717]" />
        </button>
        <h1 className="text-[16px] font-bold text-[#171717]">{isNew ? "새 일정" : "일정 상세"}</h1>
        {!isNew && (
          <button onClick={() => setEditMode(!editMode)} className="ml-auto text-[13px] text-[#EAB308] font-semibold">
            {editMode ? "취소" : "편집"}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
        {event?.is_ai_generated && (
          <div className="flex items-center gap-2 bg-[#FEF9C3] rounded-xl px-3 py-2.5">
            <Sparkle size={15} weight="fill" className="text-[#EAB308]" />
            <span className="text-[12px] font-semibold text-[#A16207]">AI가 자동 생성한 일정</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
            <NotePencil size={16} weight="fill" className="text-[#EAB308] shrink-0" />
            <span className="text-[12px] text-[#737373] w-10 shrink-0">제목</span>
            {editMode ? (
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="일정 제목을 입력하세요"
                className="flex-1 text-[13px] text-[#171717] font-medium outline-none bg-transparent placeholder:text-[#A3A3A3]" />
            ) : (
              <span className="flex-1 text-[13px] text-[#171717] font-medium">{event?.title || "제목 없음"}</span>
            )}
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
            <CalendarBlank size={16} weight="fill" className="text-[#EAB308] shrink-0" />
            <span className="text-[12px] text-[#737373] w-10 shrink-0">날짜</span>
            <span className="flex-1 text-[13px] text-[#171717] font-medium">{fmtDate(event?.event_date ?? null)}</span>
            {editMode && <CaretDown size={13} className="text-[#A3A3A3]" />}
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
            <Clock size={16} weight="fill" className="text-[#EAB308] shrink-0" />
            <span className="text-[12px] text-[#737373] w-10 shrink-0">시간</span>
            <span className="flex-1 text-[13px] text-[#171717] font-medium">{fmtTime(event?.event_time ?? null) || "시간 없음"}</span>
            {editMode && <CaretDown size={13} className="text-[#A3A3A3]" />}
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
            <MapPin size={16} weight="fill" className="text-[#EAB308] shrink-0" />
            <span className="text-[12px] text-[#737373] w-10 shrink-0">장소</span>
            {editMode ? (
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="장소를 입력하세요"
                className="flex-1 text-[13px] text-[#171717] font-medium outline-none bg-transparent placeholder:text-[#A3A3A3]" />
            ) : (
              <span className="flex-1 text-[13px] text-[#171717] font-medium">{event?.location || "장소 없음"}</span>
            )}
          </div>
          <div className="flex items-start gap-3 px-4 py-3.5">
            <NotePencil size={16} weight="fill" className="text-[#EAB308] shrink-0 mt-0.5" />
            <span className="text-[12px] text-[#737373] w-10 shrink-0 mt-0.5">메모</span>
            {editMode ? (
              <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="메모를 입력하세요" rows={2}
                className="flex-1 text-[13px] text-[#171717] font-medium outline-none bg-transparent placeholder:text-[#A3A3A3] resize-none" />
            ) : (
              <span className="flex-1 text-[13px] text-[#171717] font-medium">{event?.memo || "-"}</span>
            )}
          </div>
        </div>

        {event?.participants && (event.participants as string[]).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} weight="fill" className="text-[#EAB308]" />
              <span className="text-[13px] font-semibold text-[#171717]">참여자</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(event.participants as string[]).map((name) => (
                <div key={name} className="flex items-center gap-1.5 bg-[#FEF9C3] rounded-full px-3 py-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#EAB308] flex items-center justify-center text-[9px] font-bold text-[#1A1A1A]">{name.slice(0, 1)}</div>
                  <span className="text-[12px] font-medium text-[#A16207]">{name}</span>
                  {editMode && <X size={11} className="text-[#A16207]" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRinging size={15} weight="fill" className="text-[#EAB308]" />
              <span className="text-[13px] font-semibold text-[#171717]">버퍼 알림 설정</span>
            </div>
            <button onClick={() => setAlertEnabled(!alertEnabled)}
              className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${alertEnabled ? "bg-[#EAB308]" : "bg-[#E5E5E5]"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${alertEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          {alertEnabled && (
            <>
              <div>
                <p className="text-[11px] text-[#737373] mb-2">알림 시점</p>
                <div className="flex gap-2">
                  {ALERT_OPTIONS.map(mins => (
                    <button key={mins} onClick={() => setAlertMins(mins)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${alertMins === mins ? "bg-[#EAB308] text-[#1A1A1A] border-[#EAB308]" : "bg-white text-[#737373] border-[#E5E5E5]"}`}>
                      {mins < 60 ? `${mins}분 전` : "1시간 전"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#737373] mb-2">중요도</p>
                <div className="flex gap-2">
                  {IMPORTANCE_LEVELS.map(({ label, value, cls }) => (
                    <button key={value} onClick={() => setImportance(value)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold ${cls} ${importance === value ? "ring-2 ring-[#EAB308]" : ""}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <SmartAlertBadge label={alertMins < 60 ? `${alertMins}분 전 알림` : "1시간 전 알림"} important />
            </>
          )}
        </div>

        {error && <p className="text-[12px] text-red-500 font-medium px-1">{error}</p>}
      </div>

      <div className="px-4 pb-6 pt-3 bg-white border-t border-[#E5E5E5] flex flex-col gap-2">
        {(editMode || isNew) && (
          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[15px] font-bold shadow-md shadow-yellow-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            {saving && <div className="w-4 h-4 rounded-full border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] animate-spin" />}
            저장하기
          </button>
        )}
        {!isNew && (
          <button onClick={handleDelete} disabled={deleting}
            className="text-[13px] text-red-400 text-center py-1 font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Trash size={14} weight="fill" />
            {deleting ? "삭제 중..." : "일정 삭제"}
          </button>
        )}
      </div>
      <div className="h-8" />
    </div>
  )
}

"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { CaretLeft, CaretRight, Plus, DotsThreeVertical, Clock, MapPin } from "@phosphor-icons/react"
import Link from "next/link"
import { BottomNav, Spinner, StatusBar } from "@/components/tcm/shared"
import { MOCK_EVENTS } from "@/lib/mock-data"
import { getCalendarEvents } from "@/lib/api"
import type { CalendarEvent } from "@/lib/types/database"

const DOW = ["일","월","화","수","목","금","토"]

export default function CalendarPage() {
  const searchParams = useSearchParams()
  const today = new Date()

  const initDate = searchParams.get("date") ? new Date(searchParams.get("date")!) : today
  const [year, setYear] = useState(initDate.getFullYear())
  const [month, setMonth] = useState(initDate.getMonth())
  const [selectedDate, setSelectedDate] = useState(initDate.toISOString().split("T")[0])
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"monthly" | "weekly">("monthly")

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length < 42) cells.push(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCalendarEvents(year, month + 1)
      if (data?.length) setEvents(data)
    } catch { /* 목업 유지 */ }
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  function dotType(day: number): "ai" | "manual" | "both" | null {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayEvents = events.filter(e => e.event_date === iso)
    if (!dayEvents.length) return null
    const hasAI = dayEvents.some(e => e.is_ai_generated)
    const hasManual = dayEvents.some(e => !e.is_ai_generated)
    if (hasAI && hasManual) return "both"
    return hasAI ? "ai" : "manual"
  }

  const selectedEvents = events.filter(e => e.event_date === selectedDate)
  const todayISO = today.toISOString().split("T")[0]

  function fmtTime(t: string | null) {
    if (!t) return ""
    const [h, m] = t.split(":")
    const hour = parseInt(h)
    return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      <div className="h-11" />
      <StatusBar />

      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-[18px] font-black text-[#171717]">캘린더</h1>
        <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-xl p-1">
          {["monthly", "weekly"].map((v, i) => (
            <button key={v} onClick={() => setView(v as "monthly" | "weekly")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${view === v ? "bg-[#EAB308] text-[#1A1A1A]" : "text-[#737373]"}`}>
              {i === 0 ? "월간" : "주간"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
            <CaretLeft size={14} weight="bold" className="text-[#737373]" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[16px] font-black text-[#171717]">{year}년 {month + 1}월</span>
            <span className="text-[11px] text-[#737373]">오늘: {today.getDate()}일</span>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
            <CaretRight size={14} weight="bold" className="text-[#737373]" />
          </button>
        </div>

        <div className="bg-white mx-4 rounded-2xl border border-[#E5E5E5] shadow-sm p-3">
          <div className="grid grid-cols-7 mb-2">
            {DOW.map((d, i) => (
              <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[#737373]"}`}>{d}</div>
            ))}
          </div>
          {loading ? <Spinner /> : (
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, idx) => {
                const colIdx = idx % 7
                const iso = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : ""
                const isToday = iso === todayISO
                const isSelected = iso === selectedDate
                const dot = day ? dotType(day) : null
                return (
                  <div key={idx} className="flex flex-col items-center gap-0.5 py-0.5">
                    {day ? (
                      <>
                        <button onClick={() => setSelectedDate(iso)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${
                            isToday ? "bg-[#EAB308] text-[#1A1A1A] shadow-sm"
                            : isSelected ? "bg-[#FEF9C3] text-[#1A1A1A]"
                            : colIdx === 0 ? "text-red-400"
                            : colIdx === 6 ? "text-blue-400"
                            : "text-[#171717]"
                          }`}>{day}</button>
                        <div className="flex gap-0.5 h-1.5">
                          {(dot === "ai" || dot === "both") && <div className="w-1 h-1 rounded-full bg-[#EAB308]" />}
                          {(dot === "manual" || dot === "both") && <div className="w-1 h-1 rounded-full bg-[#A3A3A3]" />}
                        </div>
                      </>
                    ) : <div className="w-7 h-7" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4 px-5 py-2">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EAB308]" /><span className="text-[11px] text-[#737373]">AI 자동 생성</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#A3A3A3]" /><span className="text-[11px] text-[#737373]">수동 입력</span></div>
        </div>

        <div className="flex flex-col gap-3 px-4 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
            <span className="text-[13px] font-bold text-[#171717]">
              {new Date(selectedDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} 일정
            </span>
            <span className="ml-auto text-[12px] text-[#EAB308] font-semibold">{selectedEvents.length}개</span>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-[13px] text-[#A3A3A3] text-center py-4">이 날의 일정이 없어요</p>
          ) : (
            selectedEvents.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <div className="bg-white rounded-2xl overflow-hidden flex shadow-sm border border-[#E5E5E5]">
                  <div className={`w-1 flex-shrink-0 ${event.is_ai_generated ? "bg-[#EAB308]" : "bg-[#A3A3A3]"}`} />
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-[14px] font-semibold text-[#171717]">{event.title}</p>
                      <DotsThreeVertical size={18} className="text-[#A3A3A3]" />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      {event.event_time && (
                        <div className="flex items-center gap-1">
                          <Clock size={11} weight="fill" className="text-[#737373]" />
                          <span className="text-[12px] text-[#737373]">{fmtTime(event.event_time)}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={11} weight="fill" className="text-[#737373]" />
                          <span className="text-[12px] text-[#737373] truncate max-w-[120px]">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <Link href={`/events/new?date=${selectedDate}`} className="absolute bottom-20 right-4 w-[52px] h-[52px] rounded-full bg-[#EAB308] shadow-lg shadow-yellow-200 flex items-center justify-center">
        <Plus size={24} weight="bold" className="text-[#1A1A1A]" />
      </Link>

      <BottomNav />
    </div>
  )
}

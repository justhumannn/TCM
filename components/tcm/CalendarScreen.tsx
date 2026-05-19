"use client"

import { CaretLeft, CaretRight, Plus, DotsThreeVertical, Clock, MapPin } from "@phosphor-icons/react"
import { BottomNav } from "./shared"

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"]
const today = 29

// Build May 2025 calendar
const firstDay = 4 // Thursday (0=Sun)
const daysInMonth = 31
const calendarCells: (number | null)[] = [
  ...Array(firstDay).fill(null),
  ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
]
// Pad to 6 weeks
while (calendarCells.length < 42) calendarCells.push(null)

const eventDots: Record<number, "ai" | "manual" | "both"> = {
  27: "manual", 29: "ai", 30: "both", 31: "ai", 3: "manual", 5: "ai",
}

const selectedEvents = [
  { id: 1, type: "ai", title: "강남역 저녁 약속", time: "오후 7:00", location: "강남역 2번 출구" },
  { id: 2, type: "ai", title: "팀 회의", time: "오전 10:00", location: "회사 2층 회의실" },
]

export default function CalendarScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      <div className="h-11" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-[18px] font-black text-[#171717]">캘린더</h1>
        <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-xl p-1">
          {["월간", "주간"].map((v, i) => (
            <button key={v} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${i === 0 ? "bg-[#EAB308] text-[#1A1A1A]" : "text-[#737373]"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 flex flex-col">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 py-2">
          <button className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
            <CaretLeft size={14} weight="bold" className="text-[#737373]" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[16px] font-black text-[#171717]">2025년 5월</span>
            <span className="text-[11px] text-[#737373]">오늘: {today}일</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
            <CaretRight size={14} weight="bold" className="text-[#737373]" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white mx-4 rounded-2xl border border-[#E5E5E5] shadow-sm p-3">
          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2">
            {daysOfWeek.map((d, i) => (
              <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[#737373]"}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Date cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((day, idx) => {
              const isToday = day === today
              const isSelected = day === today
              const dot = day ? eventDots[day] : undefined
              const colIdx = idx % 7

              return (
                <div key={idx} className="flex flex-col items-center gap-0.5 py-0.5">
                  {day ? (
                    <>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${
                        isToday
                          ? "bg-[#EAB308] text-[#1A1A1A] shadow-sm"
                          : isSelected
                          ? "bg-[#FEF9C3] text-[#1A1A1A]"
                          : colIdx === 0
                          ? "text-red-400"
                          : colIdx === 6
                          ? "text-blue-400"
                          : "text-[#171717]"
                      }`}>
                        {day}
                      </div>
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
        </div>

        {/* Legend */}
        <div className="flex gap-4 px-5 py-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#EAB308]" />
            <span className="text-[11px] text-[#737373]">AI 자동 생성</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#A3A3A3]" />
            <span className="text-[11px] text-[#737373]">수동 입력</span>
          </div>
        </div>

        {/* Selected date events */}
        <div className="flex flex-col gap-3 px-4 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
            <span className="text-[13px] font-bold text-[#171717]">5월 29일 (목) 일정</span>
            <span className="ml-auto text-[12px] text-[#EAB308] font-semibold">{selectedEvents.length}개</span>
          </div>
          {selectedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl overflow-hidden flex shadow-sm border border-[#E5E5E5]">
              <div className={`w-1 flex-shrink-0 ${event.type === "ai" ? "bg-[#EAB308]" : "bg-[#A3A3A3]"}`} />
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <p className="text-[14px] font-semibold text-[#171717]">{event.title}</p>
                  <button>
                    <DotsThreeVertical size={18} className="text-[#A3A3A3]" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Clock size={11} weight="fill" className="text-[#737373]" />
                    <span className="text-[12px] text-[#737373]">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={11} weight="fill" className="text-[#737373]" />
                    <span className="text-[12px] text-[#737373]">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button className="absolute bottom-20 right-4 w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#EAB308] shadow-lg shadow-yellow-200 flex items-center justify-center">
        <Plus size={24} weight="bold" className="text-[#1A1A1A]" />
      </button>

      <BottomNav active="calendar" />
    </div>
  )
}

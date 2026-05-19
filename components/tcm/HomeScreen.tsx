"use client"

import { Bell, Gear, CalendarCheck, ChatCircleDots, CheckCircle } from "@phosphor-icons/react"
import { BottomNav, EventDetectionCard, Avatar } from "./shared"

const weekDays = ["월", "화", "수", "목", "금", "토", "일"]
const weekDates = [26, 27, 28, 29, 30, 31, 1]
const todayIdx = 3 // 목요일
const hasEvent = [false, true, false, true, true, false, true]

export default function HomeScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden">
      {/* Safe area top */}
      <div className="h-11" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar initials="김민" size="md" />
          <div>
            <p className="text-[14px] font-semibold text-[#171717]">안녕하세요, 김민준님 👋</p>
            <p className="text-[12px] text-[#737373]">오늘도 좋은 하루 되세요</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={22} weight="regular" className="text-[#171717]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button>
            <Gear size={22} weight="regular" className="text-[#171717]" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col gap-4">
        {/* Status card */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)" }}>
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-1 top-10 w-14 h-14 rounded-full bg-white/10" />
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <span className="text-[15px] font-bold text-white">AI 모니터링 중</span>
              </div>
              <p className="text-[12px] text-yellow-100 leading-relaxed mt-1">
                카카오톡 대화를 실시간으로<br />분석하고 있어요
              </p>
            </div>
            {/* Toggle */}
            <div className="flex flex-col items-end gap-1">
              <div className="w-12 h-7 rounded-full bg-white flex items-center px-1 cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-[#EAB308] ml-auto shadow-sm" />
              </div>
              <span className="text-[10px] text-yellow-100">활성화됨</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: CalendarCheck, label: "이번 주 일정", value: "8", color: "#EAB308" },
            { icon: ChatCircleDots, label: "감지된 약속", value: "3", color: "#F59E0B" },
            { icon: CheckCircle, label: "저장 완료", value: "21", color: "#10B981" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-[#E5E5E5] flex flex-col items-center gap-1.5">
              <Icon size={20} weight="fill" style={{ color }} />
              <span className="text-[17px] font-black text-[#171717]">{value}</span>
              <span className="text-[10px] text-[#737373] text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Mini calendar strip */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold text-[#171717]">이번 주 일정</span>
            <span className="text-[12px] text-[#EAB308] font-semibold">2025년 5월</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-medium ${i === 6 ? "text-red-400" : i === 5 ? "text-blue-400" : "text-[#737373]"}`}>{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                  i === todayIdx
                    ? "bg-[#EAB308] text-[#1A1A1A]"
                    : "text-[#171717]"
                }`}>
                  {weekDates[i]}
                </div>
                <div className={`w-1 h-1 rounded-full ${hasEvent[i] ? "bg-[#EAB308]" : "bg-transparent"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Recently detected section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-[#171717]">최근 감지된 약속</span>
            <button className="text-[12px] text-[#EAB308] font-semibold">전체보기</button>
          </div>
          <div className="flex flex-col gap-3">
            <EventDetectionCard
              room="대학 동기 단톡방"
              participants={6}
              datetime="2025년 6월 3일 (화) 오후 7:00"
              preview="내일 저녁 강남역에서 보자! 다들 가능해?"
            />
            <EventDetectionCard
              room="팀 프로젝트"
              participants={4}
              datetime="2025년 6월 5일 (목) 오전 10:00"
              preview="목요일 오전 회의 가능한 사람? 장소는 회사 2층"
            />
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="home" />
    </div>
  )
}

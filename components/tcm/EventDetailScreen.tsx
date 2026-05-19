"use client"

import { ArrowLeft, Sparkle, CalendarBlank, Clock, MapPin, Users, NotePencil, BellRinging, CaretDown, X } from "@phosphor-icons/react"
import { SmartAlertBadge } from "./shared"

const alertOptions = ["15분 전", "30분 전", "45분 전", "1시간 전"]
const importanceLevels = [
  { label: "일반", color: "bg-[#F5F5F5] text-[#737373]" },
  { label: "중요", color: "bg-[#FEF9C3] text-[#A16207]" },
  { label: "매우 중요", color: "bg-[#EAB308] text-[#1A1A1A]" },
]

export default function EventDetailScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <div className="h-11" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button className="w-9 h-9 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
          <ArrowLeft size={16} weight="bold" className="text-[#171717]" />
        </button>
        <h1 className="text-[16px] font-bold text-[#171717]">일정 상세</h1>
        <button className="ml-auto text-[13px] text-[#EAB308] font-semibold">편집</button>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
        {/* AI badge */}
        <div className="flex items-center gap-2 bg-[#FEF9C3] rounded-xl px-3 py-2.5">
          <Sparkle size={15} weight="fill" className="text-[#EAB308]" />
          <span className="text-[12px] font-semibold text-[#A16207]">AI가 자동 생성한 일정</span>
          <span className="ml-auto text-[11px] text-[#A16207] bg-[#FEF08A] px-2 py-0.5 rounded-full font-bold">신뢰도 94%</span>
        </div>

        {/* Event fields */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
          {[
            { icon: NotePencil, label: "제목", value: "강남역 저녁 약속", isInput: true },
            { icon: CalendarBlank, label: "날짜", value: "2025년 6월 3일 (화)", isInput: false },
            { icon: Clock, label: "시간", value: "오후 7:00", isInput: false },
            { icon: MapPin, label: "장소", value: "강남역 2번 출구", isInput: true },
            { icon: NotePencil, label: "메모", value: "저녁 식사 약속", isInput: true, isLast: true },
          ].map(({ icon: Icon, label, value, isLast }, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? "border-b border-[#F5F5F5]" : ""}`}>
              <Icon size={16} weight="fill" className="text-[#EAB308] flex-shrink-0" />
              <span className="text-[12px] text-[#737373] w-10 flex-shrink-0">{label}</span>
              <span className="text-[13px] text-[#171717] font-medium flex-1">{value}</span>
              <CaretDown size={13} className="text-[#A3A3A3]" />
            </div>
          ))}
        </div>

        {/* Participants chips */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} weight="fill" className="text-[#EAB308]" />
            <span className="text-[13px] font-semibold text-[#171717]">참여자</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["김민준", "이서연", "박지훈"].map((name) => (
              <div key={name} className="flex items-center gap-1.5 bg-[#FEF9C3] rounded-full px-3 py-1.5">
                <div className="w-4 h-4 rounded-full bg-[#EAB308] flex items-center justify-center text-[9px] font-bold text-[#1A1A1A]">
                  {name.slice(0, 1)}
                </div>
                <span className="text-[12px] font-medium text-[#A16207]">{name}</span>
                <X size={11} className="text-[#A16207]" />
              </div>
            ))}
            <button className="flex items-center gap-1 bg-[#F5F5F5] rounded-full px-3 py-1.5">
              <span className="text-[12px] text-[#737373]">+ 추가</span>
            </button>
          </div>
        </div>

        {/* Smart alert settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRinging size={15} weight="fill" className="text-[#EAB308]" />
              <span className="text-[13px] font-semibold text-[#171717]">버퍼 알림 설정</span>
            </div>
            {/* Toggle on */}
            <div className="w-11 h-6 rounded-full bg-[#EAB308] flex items-center px-1 cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-white ml-auto shadow-sm" />
            </div>
          </div>

          {/* Alert timing */}
          <div>
            <p className="text-[11px] text-[#737373] mb-2">알림 시점</p>
            <div className="flex gap-2">
              {alertOptions.map((opt, i) => (
                <button key={opt} className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                  i === 1
                    ? "bg-[#EAB308] text-[#1A1A1A] border-[#EAB308]"
                    : "bg-white text-[#737373] border-[#E5E5E5]"
                }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Importance */}
          <div>
            <p className="text-[11px] text-[#737373] mb-2">중요도</p>
            <div className="flex gap-2">
              {importanceLevels.map(({ label, color }, i) => (
                <button key={label} className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold ${color} ${i === 1 ? "ring-2 ring-[#EAB308]" : ""}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <SmartAlertBadge label="30분 전 알림" important />
        </div>

        {/* Original chat accordion */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F5F5F5]">
            <span className="text-[13px] font-semibold text-[#171717]">원본 대화 보기</span>
            <CaretDown size={16} className="text-[#737373]" />
          </div>
          <div className="p-4 flex flex-col gap-2 bg-[#FAFAFA]">
            {[
              { sender: "이서연", text: "다들 내일 저녁 시간 돼?", time: "18:30" },
              { sender: "나", text: "나 가능! 강남역 어때?", time: "18:31" },
              { sender: "박지훈", text: "좋아, 강남역 2번 출구 오후 7시에 보자!", time: "18:32" },
            ].map((msg, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] mt-2 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-[#737373]">{msg.sender} · {msg.time}</span>
                  <p className="text-[12px] text-[#171717]">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-6 pt-3 bg-white border-t border-[#E5E5E5] flex flex-col gap-2">
        <button className="w-full py-4 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[15px] font-bold shadow-md shadow-yellow-200">
          저장하기
        </button>
        <button className="text-[13px] text-red-400 text-center py-1 font-medium">일정 삭제</button>
      </div>

      <div className="h-8" />
    </div>
  )
}

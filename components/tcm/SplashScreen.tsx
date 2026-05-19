"use client"

import { ChatCircle, CalendarBlank } from "@phosphor-icons/react"

export default function SplashScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Safe area top */}
      <div className="h-11" />

      {/* Main content */}
      <div className="flex flex-col flex-1 items-center justify-center px-6 gap-6">
        {/* Logo mark */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-[#EAB308] shadow-lg shadow-yellow-300/40">
          <div className="relative">
            <CalendarBlank size={36} weight="fill" className="text-[#1A1A1A]" />
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <ChatCircle size={12} weight="fill" className="text-[#EAB308]" />
            </div>
          </div>
        </div>

        {/* App name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-black tracking-tight text-[#171717]">TCM</h1>
          <div className="w-8 h-1 rounded-full bg-[#EAB308]" />
        </div>

        {/* Tagline */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[17px] font-semibold text-[#171717] leading-snug">
            대화가 이루어지는 순간,<br />일정이 자동 생성
          </p>
          <p className="text-[13px] text-[#737373] leading-relaxed px-4">
            카카오톡 메신저를 AI가 분석해<br />캘린더에 자동 저장합니다
          </p>
        </div>

        {/* Illustration dots */}
        <div className="flex gap-2 my-2">
          {[1,2,3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === 1 ? "w-6 bg-[#EAB308]" : "w-2 bg-[#E5E5E5]"}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-4 px-6 pb-4">
        <button className="w-full py-4 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[16px] font-bold shadow-md shadow-yellow-200 active:scale-95 transition-transform">
          시작하기
        </button>
        <button className="text-[14px] text-[#737373] py-2">
          나중에 하기
        </button>
      </div>

      {/* Safe area bottom */}
      <div className="h-8" />
    </div>
  )
}

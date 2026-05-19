"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarBlank, ChatCircle } from "@phosphor-icons/react"
import { StatusBar } from "@/components/tcm/shared"

const SLIDES = [
  {
    headline: "대화가 이루어지는 순간,\n일정이 자동 생성",
    sub: "카카오톡 메신저를 AI가 분석해\n캘린더에 자동 저장합니다",
  },
  {
    headline: "약속 잡는 순간\nAI가 바로 감지",
    sub: "날짜·시간·장소·참여자를\n자동으로 추출해 드려요",
  },
  {
    headline: "Google 캘린더와\n실시간 동기화",
    sub: "저장된 일정은 모든 기기에서\n바로 확인할 수 있어요",
  },
]

export default function SplashPage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)

  function handleNext() {
    if (slide < SLIDES.length - 1) {
      setSlide(s => s + 1)
    } else {
      router.push("/home")
    }
  }

  const current = SLIDES[slide]

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] select-none">
      {/* 상태바 */}
      <div className="h-11" />
      <StatusBar theme="light" />

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col flex-1 items-center justify-center px-8 gap-8">

        {/* 앱 로고 */}
        <div
          className="relative flex items-center justify-center rounded-3xl bg-[#EAB308]"
          style={{
            width: 96,
            height: 96,
            boxShadow: "0 12px 32px rgba(234,179,8,0.38)",
          }}
        >
          <div className="relative">
            <CalendarBlank size={38} weight="fill" className="text-[#1A1A1A]" />
            <div className="absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <ChatCircle size={13} weight="fill" className="text-[#EAB308]" />
            </div>
          </div>
        </div>

        {/* 앱 이름 */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[52px] font-black tracking-tight text-[#171717] leading-none">
            TCM
          </h1>
          <div className="w-9 h-[3px] rounded-full bg-[#EAB308]" />
        </div>

        {/* 슬라이드 텍스트 */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[18px] font-bold text-[#171717] leading-snug whitespace-pre-line">
            {current.headline}
          </p>
          <p className="text-[13px] text-[#737373] leading-relaxed whitespace-pre-line">
            {current.sub}
          </p>
        </div>

        {/* 페이지 도트 */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === slide ? "w-6 bg-[#EAB308]" : "w-2 bg-[#E5E5E5]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="flex flex-col items-center gap-3 px-6 pb-6">
        <button
          onClick={handleNext}
          className="w-full py-[18px] rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[16px] font-bold active:scale-[0.97] transition-transform"
          style={{ boxShadow: "0 4px 16px rgba(234,179,8,0.35)" }}
        >
          {slide < SLIDES.length - 1 ? "다음" : "시작하기"}
        </button>
        <button
          onClick={() => router.push("/home")}
          className="text-[14px] text-[#737373] py-2 font-medium"
        >
          나중에 하기
        </button>
      </div>

      <div className="h-4" />
    </div>
  )
}

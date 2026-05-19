"use client"

import { useRouter } from "next/navigation"
import { CalendarBlank, ChatCircle } from "@phosphor-icons/react"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <div className="h-11" />

      <div className="flex flex-col items-center gap-4 pt-16 pb-8">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAB308] shadow-lg shadow-yellow-300/40">
          <CalendarBlank size={28} weight="fill" className="text-[#1A1A1A]" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <ChatCircle size={11} weight="fill" className="text-[#EAB308]" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-[26px] font-black tracking-tight text-[#171717]">TCM</h1>
          <p className="text-[13px] text-[#737373] mt-0.5">Talk-to-Calendar Manager</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mx-6 mt-4">
        <p className="text-[14px] text-[#737373] text-center leading-relaxed">
          카카오톡 대화에서 약속을 자동으로 감지하고<br />캘린더에 저장해드려요
        </p>
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-3 mx-6 mb-8">
        <button
          onClick={() => router.replace("/home")}
          className="w-full py-4 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[16px] font-bold shadow-md shadow-yellow-200 active:scale-[0.98] transition-transform"
        >
          시작하기
        </button>
        <p className="text-center text-[11px] text-[#A3A3A3]">
          로컬 모드 · 인증 없음
        </p>
      </div>
    </div>
  )
}

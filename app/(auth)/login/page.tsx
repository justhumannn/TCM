"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarBlank, ChatCircle, Eye, EyeSlash, Spinner } from "@phosphor-icons/react"
import { supabase } from "@/lib/supabase"

type Mode = "login" | "signup"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace("/home")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) throw error
        setError("가입 확인 이메일을 보냈습니다. 이메일을 확인해 주세요.")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <div className="h-11" />

      {/* 로고 */}
      <div className="flex flex-col items-center gap-4 pt-10 pb-8">
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

      {/* 탭 */}
      <div className="flex mx-6 bg-[#F5F5F5] rounded-2xl p-1 gap-1 mb-6">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError("") }}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              mode === m ? "bg-white text-[#171717] shadow-sm" : "text-[#737373]"
            }`}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mx-6">
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#737373]">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E5E5] bg-white text-[14px] text-[#171717] placeholder:text-[#A3A3A3] outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#EAB308]/20 transition"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-[#737373]">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E5E5] bg-white text-[14px] text-[#171717] placeholder:text-[#A3A3A3] outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#EAB308]/20 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-[#737373]">비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              minLength={6}
              className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-[#E5E5E5] bg-white text-[14px] text-[#171717] placeholder:text-[#A3A3A3] outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#EAB308]/20 transition"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3]"
            >
              {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* 오류/안내 메시지 */}
        {error && (
          <p className={`text-[12px] font-medium px-1 ${error.includes("이메일") ? "text-green-600" : "text-red-500"}`}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[16px] font-bold shadow-md shadow-yellow-200 active:scale-[0.98] transition-transform disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
        >
          {loading && <Spinner size={18} className="animate-spin" />}
          {mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>

      {/* 구분선 */}
      <div className="flex items-center gap-3 mx-6 mt-6">
        <div className="flex-1 h-px bg-[#E5E5E5]" />
        <span className="text-[11px] text-[#A3A3A3] font-medium">또는</span>
        <div className="flex-1 h-px bg-[#E5E5E5]" />
      </div>

      {/* 카카오 (디자인 목업 — 실제 OAuth 미구현) */}
      <button
        type="button"
        className="mx-6 mt-4 py-3.5 rounded-2xl bg-[#FEE500] text-[#191919] text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <ChatCircle size={18} weight="fill" />
        카카오로 시작하기
      </button>

      <div className="flex-1" />
      <p className="text-center text-[11px] text-[#A3A3A3] pb-8">
        TCM · Talk-to-Calendar Manager
      </p>
    </div>
  )
}

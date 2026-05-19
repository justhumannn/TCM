"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell, Sliders, ChatCircle, Translate, Trash, Info,
  CaretRight, CheckCircle, GoogleLogo, Database, SignOut,
} from "@phosphor-icons/react"
import { supabase } from "@/lib/supabase"
import { Avatar, BottomNav, Toggle, Spinner, StatusBar } from "@/components/tcm/shared"
import { MOCK_USER } from "@/lib/mock-data"
import type { User, AISensitivity } from "@/lib/types/database"

const SENSITIVITY_LABELS: Record<AISensitivity, string> = {
  low: "낮음", medium: "보통", high: "높음",
}
const SENSITIVITY_VALUES: AISensitivity[] = ["low", "medium", "high"]

function SectionHeader({ title }: { title: string }) {
  return <p className="text-[11px] font-bold text-[#737373] uppercase tracking-wider px-1 mt-1 mb-2">{title}</p>
}

function SettingRow({
  icon: Icon,
  label,
  value,
  hasArrow = true,
  badge,
  toggle,
  onToggle,
  danger = false,
  onClick,
}: {
  icon: React.ElementType
  label: string
  value?: string
  hasArrow?: boolean
  badge?: React.ReactNode
  toggle?: boolean
  onToggle?: () => void
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5] last:border-0 w-full text-left bg-white`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : "bg-[#FEF9C3]"}`}>
        <Icon size={16} weight="fill" className={danger ? "text-red-400" : "text-[#EAB308]"} />
      </div>
      <span className={`flex-1 text-[13px] font-medium ${danger ? "text-red-400" : "text-[#171717]"}`}>{label}</span>
      {badge && badge}
      {value && <span className="text-[12px] text-[#737373]">{value}</span>}
      {toggle !== undefined && onToggle && (
        <Toggle on={toggle} onToggle={onToggle} />
      )}
      {hasArrow && toggle === undefined && <CaretRight size={14} className="text-[#A3A3A3]" />}
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(MOCK_USER)
  const [loading] = useState(false)
  const [googleLinked, setGoogleLinked] = useState(MOCK_USER.google_calendar_connected)
  const [sensitivity, setSensitivity] = useState<AISensitivity>(MOCK_USER.ai_sensitivity)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single()
      if (data) {
        const u = data as User
        setUser(u)
        setGoogleLinked(u.google_calendar_connected)
        setSensitivity(u.ai_sensitivity)
      }
    }
    load()
  }, [])

  async function updateSetting(patch: Partial<User>) {
    if (!user) return
    setSaving(true)
    await supabase.from("users").update(patch).eq("id", user.id)
    setUser({ ...user, ...patch })
    setSaving(false)
  }

  async function toggleGoogle() {
    const next = !googleLinked
    setGoogleLinked(next)
    await updateSetting({ google_calendar_connected: next })
  }

  async function changeSensitivity(val: AISensitivity) {
    setSensitivity(val)
    await updateSetting({ ai_sensitivity: val })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  async function handleReset() {
    if (!confirm("모든 데이터를 초기화하시겠어요? 되돌릴 수 없습니다.")) return
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    await supabase.from("calendar_events").delete().eq("user_id", authUser.id)
    await supabase.from("detected_events").delete().eq("user_id", authUser.id)
    router.replace("/home")
  }

  const sensitivityPct = { low: 25, medium: 50, high: 75 }[sensitivity]

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      <div className="h-11" />
      <StatusBar />

      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-[18px] font-black text-[#171717]">설정</h1>
        {saving && <div className="w-4 h-4 rounded-full border-2 border-[#E5E5E5] border-t-[#EAB308] animate-spin" />}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-4 flex flex-col gap-4">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* 프로필 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
              <div className="flex items-center gap-4">
                <Avatar initials={user?.name?.slice(0, 2) ?? "TC"} size="lg" />
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#171717]">{user?.name ?? "사용자"}</p>
                  <p className="text-[12px] text-[#737373]">{user?.email}</p>
                  {user?.kakao_connected && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-[11px] text-green-600 font-medium">카카오톡 연결됨</span>
                    </div>
                  )}
                </div>
                <button className="px-3 py-1.5 rounded-xl border border-[#E5E5E5] text-[12px] text-[#737373] font-medium">
                  편집
                </button>
              </div>
            </div>

            {/* 연동 상태 */}
            <div>
              <SectionHeader title="연동 상태" />
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                {/* 카카오톡 */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center flex-shrink-0">
                    <ChatCircle size={16} weight="fill" className="text-[#EAB308]" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-[#171717]">카카오톡</span>
                  {user?.kakao_connected ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[12px] text-green-600 font-semibold">연결됨</span>
                    </div>
                  ) : (
                    <button className="text-[12px] text-[#EAB308] font-semibold px-3 py-1 rounded-lg border border-[#EAB308]">
                      연결
                    </button>
                  )}
                </div>
                {/* Google 캘린더 */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
                  <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                    <GoogleLogo size={16} weight="fill" className="text-blue-500" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-[#171717]">Google 캘린더</span>
                  <Toggle on={googleLinked} onToggle={toggleGoogle} />
                </div>
                {/* Supabase */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                    <Database size={16} weight="fill" className="text-green-600" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-[#171717]">Supabase 동기화</span>
                  <CheckCircle size={18} weight="fill" className="text-green-500" />
                </div>
              </div>
            </div>

            {/* AI 설정 */}
            <div>
              <SectionHeader title="AI 설정" />
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <SettingRow icon={Bell} label="알림 설정" hasArrow />
                {/* 감지 민감도 슬라이더 */}
                <div className="px-4 py-3.5 border-b border-[#F5F5F5]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center flex-shrink-0">
                      <Sliders size={16} weight="fill" className="text-[#EAB308]" />
                    </div>
                    <span className="flex-1 text-[13px] font-medium text-[#171717]">AI 감지 민감도</span>
                    <span className="text-[12px] font-bold text-[#EAB308]">{SENSITIVITY_LABELS[sensitivity]}</span>
                  </div>
                  {/* 슬라이더 버튼 방식 */}
                  <div className="flex gap-2 px-1">
                    {SENSITIVITY_VALUES.map((val) => (
                      <button
                        key={val}
                        onClick={() => changeSensitivity(val)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                          sensitivity === val
                            ? "bg-[#EAB308] text-[#1A1A1A] border-[#EAB308]"
                            : "bg-white text-[#737373] border-[#E5E5E5]"
                        }`}
                      >
                        {SENSITIVITY_LABELS[val]}
                      </button>
                    ))}
                  </div>
                  {/* 진행 바 */}
                  <div className="flex items-center gap-2 px-1 mt-3">
                    <span className="text-[10px] text-[#A3A3A3]">낮음</span>
                    <div className="flex-1 h-2 bg-[#F5F5F5] rounded-full relative">
                      <div
                        className="absolute left-0 top-0 h-2 bg-[#EAB308] rounded-full transition-all"
                        style={{ width: `${sensitivityPct}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#EAB308] rounded-full shadow-sm transition-all"
                        style={{ left: `calc(${sensitivityPct}% - 8px)` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#A3A3A3]">높음</span>
                  </div>
                </div>
                <SettingRow icon={ChatCircle} label="모니터링 채팅방" value="설정하기" />
              </div>
            </div>

            {/* 일반 */}
            <div>
              <SectionHeader title="일반" />
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <SettingRow icon={Translate} label="언어 설정" value="한국어" />
                <SettingRow icon={Info} label="앱 정보" value="v1.0.0" />
              </div>
            </div>

            {/* 로그아웃 */}
            <div>
              <SectionHeader title="계정" />
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <SettingRow
                  icon={SignOut}
                  label="로그아웃"
                  hasArrow={false}
                  danger
                  onClick={handleSignOut}
                />
              </div>
            </div>

            {/* 데이터 */}
            <div>
              <SectionHeader title="데이터" />
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <SettingRow
                  icon={Trash}
                  label="데이터 초기화"
                  danger
                  hasArrow={false}
                  onClick={handleReset}
                />
              </div>
            </div>

            <div className="h-2" />
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import {
  Bell, Sliders, ChatCircle, Translate, Trash, Info,
  CaretRight, CheckCircle, GoogleLogo, Database, SignOut,
} from "@phosphor-icons/react"
import { Avatar, BottomNav, Toggle, StatusBar } from "@/components/tcm/shared"
import { getSettings, updateSettings } from "@/lib/api"

type AISensitivity = "low" | "medium" | "high"

const SENSITIVITY_LABELS: Record<AISensitivity, string> = { low: "낮음", medium: "보통", high: "높음" }
const SENSITIVITY_VALUES: AISensitivity[] = ["low", "medium", "high"]

function SectionHeader({ title }: { title: string }) {
  return <p className="text-[11px] font-bold text-[#737373] uppercase tracking-wider px-1 mt-1 mb-2">{title}</p>
}

function SettingRow({ icon: Icon, label, value, hasArrow = true, toggle, onToggle, danger = false, onClick }: {
  icon: React.ElementType; label: string; value?: string; hasArrow?: boolean
  toggle?: boolean; onToggle?: () => void; danger?: boolean; onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5] last:border-0 w-full text-left bg-white">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : "bg-[#FEF9C3]"}`}>
        <Icon size={16} weight="fill" className={danger ? "text-red-400" : "text-[#EAB308]"} />
      </div>
      <span className={`flex-1 text-[13px] font-medium ${danger ? "text-red-400" : "text-[#171717]"}`}>{label}</span>
      {value && <span className="text-[12px] text-[#737373]">{value}</span>}
      {toggle !== undefined && onToggle && <Toggle on={toggle} onToggle={onToggle} />}
      {hasArrow && toggle === undefined && <CaretRight size={14} className="text-[#A3A3A3]" />}
    </button>
  )
}

export default function SettingsPage() {
  const [userName, setUserName] = useState("사용자")
  const [googleLinked, setGoogleLinked] = useState(false)
  const [sensitivity, setSensitivity] = useState<AISensitivity>("high")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(s => {
      if (!s) return
      setUserName(s.userName ?? "사용자")
      setGoogleLinked(s.googleCalendarConnected ?? false)
      setSensitivity(s.aiSensitivity ?? "high")
    }).catch(() => {})
  }, [])

  async function patch(data: Record<string, unknown>) {
    setSaving(true)
    try { await updateSettings(data) } catch { /* ignore */ }
    setSaving(false)
  }

  async function toggleGoogle() {
    const next = !googleLinked
    setGoogleLinked(next)
    await patch({ google_calendar_connected: next })
  }

  async function changeSensitivity(val: AISensitivity) {
    setSensitivity(val)
    await patch({ ai_sensitivity: val })
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
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
          <div className="flex items-center gap-4">
            <Avatar initials={userName.slice(0, 2)} size="lg" />
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#171717]">{userName}</p>
              <p className="text-[12px] text-[#737373]">로컬 모드</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[11px] text-green-600 font-medium">SQLite 연결됨</span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl border border-[#E5E5E5] text-[12px] text-[#737373] font-medium">편집</button>
          </div>
        </div>

        {/* 연동 상태 */}
        <div>
          <SectionHeader title="연동 상태" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
              <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center shrink-0">
                <ChatCircle size={16} weight="fill" className="text-[#EAB308]" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#171717]">카카오톡</span>
              <button className="text-[12px] text-[#EAB308] font-semibold px-3 py-1 rounded-lg border border-[#EAB308]">연결</button>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
              <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] flex items-center justify-center shrink-0">
                <GoogleLogo size={16} weight="fill" className="text-blue-500" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#171717]">Google 캘린더</span>
              <Toggle on={googleLinked} onToggle={toggleGoogle} />
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <Database size={16} weight="fill" className="text-green-600" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#171717]">로컬 DB (SQLite)</span>
              <CheckCircle size={18} weight="fill" className="text-green-500" />
            </div>
          </div>
        </div>

        {/* AI 설정 */}
        <div>
          <SectionHeader title="AI 설정" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <SettingRow icon={Bell} label="알림 설정" hasArrow />
            <div className="px-4 py-3.5 border-b border-[#F5F5F5]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center shrink-0">
                  <Sliders size={16} weight="fill" className="text-[#EAB308]" />
                </div>
                <span className="flex-1 text-[13px] font-medium text-[#171717]">AI 감지 민감도</span>
                <span className="text-[12px] font-bold text-[#EAB308]">{SENSITIVITY_LABELS[sensitivity]}</span>
              </div>
              <div className="flex gap-2 px-1">
                {SENSITIVITY_VALUES.map(val => (
                  <button key={val} onClick={() => changeSensitivity(val)}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${sensitivity === val ? "bg-[#EAB308] text-[#1A1A1A] border-[#EAB308]" : "bg-white text-[#737373] border-[#E5E5E5]"}`}>
                    {SENSITIVITY_LABELS[val]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-1 mt-3">
                <span className="text-[10px] text-[#A3A3A3]">낮음</span>
                <div className="flex-1 h-2 bg-[#F5F5F5] rounded-full relative">
                  <div className="absolute left-0 top-0 h-2 bg-[#EAB308] rounded-full transition-all" style={{ width: `${sensitivityPct}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#EAB308] rounded-full shadow-sm transition-all" style={{ left: `calc(${sensitivityPct}% - 8px)` }} />
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

        {/* 데이터 */}
        <div>
          <SectionHeader title="데이터" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <SettingRow icon={Trash} label="데이터 초기화" danger hasArrow={false}
              onClick={async () => {
                if (!confirm("모든 데이터를 초기화하시겠어요?")) return
                await Promise.all([
                  fetch("/api/events", { method: "DELETE" }).catch(() => {}),
                  fetch("/api/detections", { method: "DELETE" }).catch(() => {}),
                ])
              }}
            />
          </div>
        </div>

        {/* 로그아웃 제거됨 — 로컬 모드 */}
        <p className="text-center text-[11px] text-[#A3A3A3] pb-2">로컬 SQLite 모드 · 인증 없음</p>
        <div className="h-2" />
      </div>

      <BottomNav />
    </div>
  )
}

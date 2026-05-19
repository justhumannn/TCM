"use client"

import {
  Bell, Sliders, ChatCircle, Translate, Trash, Info,
  CaretRight, CheckCircle, GoogleLogo, Database
} from "@phosphor-icons/react"
import { Avatar, BottomNav } from "./shared"

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
  danger = false,
}: {
  icon: React.ElementType
  label: string
  value?: string
  hasArrow?: boolean
  badge?: React.ReactNode
  toggle?: boolean
  danger?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5] last:border-0 ${danger ? "bg-white" : "bg-white"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : "bg-[#FEF9C3]"}`}>
        <Icon size={16} weight="fill" className={danger ? "text-red-400" : "text-[#EAB308]"} />
      </div>
      <span className={`flex-1 text-[13px] font-medium ${danger ? "text-red-400" : "text-[#171717]"}`}>{label}</span>
      {badge && badge}
      {value && <span className="text-[12px] text-[#737373]">{value}</span>}
      {toggle !== undefined && (
        <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${toggle ? "bg-[#EAB308]" : "bg-[#E5E5E5]"}`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${toggle ? "ml-auto" : ""}`} />
        </div>
      )}
      {hasArrow && !toggle && <CaretRight size={14} className="text-[#A3A3A3]" />}
    </div>
  )
}

export default function SettingsScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      <div className="h-11" />

      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-[18px] font-black text-[#171717]">설정</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-4 flex flex-col gap-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
          <div className="flex items-center gap-4">
            <Avatar initials="김민" size="lg" />
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#171717]">김민준</p>
              <p className="text-[12px] text-[#737373]">minj@kakao.com</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[11px] text-green-600 font-medium">카카오톡 연결됨</span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl border border-[#E5E5E5] text-[12px] text-[#737373] font-medium">
              편집
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div>
          <SectionHeader title="연동 상태" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
              <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center flex-shrink-0">
                <ChatCircle size={16} weight="fill" className="text-[#EAB308]" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#171717]">카카오톡</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[12px] text-green-600 font-semibold">연결됨</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5]">
              <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                <GoogleLogo size={16} weight="fill" className="text-blue-500" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#171717]">Google 캘린더</span>
              <div className="w-11 h-6 rounded-full bg-[#EAB308] flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white shadow-sm ml-auto" />
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                <Database size={16} weight="fill" className="text-green-600" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#171717]">Supabase 동기화</span>
              <CheckCircle size={18} weight="fill" className="text-green-500" />
            </div>
          </div>
        </div>

        {/* AI & Notifications */}
        <div>
          <SectionHeader title="AI 설정" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <SettingRow icon={Bell} label="알림 설정" hasArrow />
            <div className="px-4 py-3.5 border-b border-[#F5F5F5]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center flex-shrink-0">
                  <Sliders size={16} weight="fill" className="text-[#EAB308]" />
                </div>
                <span className="flex-1 text-[13px] font-medium text-[#171717]">AI 감지 민감도</span>
                <span className="text-[12px] font-bold text-[#EAB308]">높음</span>
              </div>
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-[#A3A3A3]">낮음</span>
                <div className="flex-1 h-2 bg-[#F5F5F5] rounded-full relative">
                  <div className="absolute left-0 top-0 h-2 bg-[#EAB308] rounded-full" style={{ width: "75%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#EAB308] rounded-full shadow-sm" style={{ left: "calc(75% - 8px)" }} />
                </div>
                <span className="text-[10px] text-[#A3A3A3]">높음</span>
              </div>
            </div>
            <SettingRow icon={ChatCircle} label="모니터링 채팅방" value="3개 선택됨" />
          </div>
        </div>

        {/* General */}
        <div>
          <SectionHeader title="일반" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <SettingRow icon={Translate} label="언어 설정" value="한국어" />
            <SettingRow icon={Info} label="앱 정보" value="v1.2.0" />
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <SectionHeader title="데이터" />
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <SettingRow icon={Trash} label="데이터 초기화" danger />
          </div>
        </div>

        <div className="h-2" />
      </div>

      <BottomNav active="settings" />
    </div>
  )
}

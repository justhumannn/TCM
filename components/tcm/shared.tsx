"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  House, CalendarBlank, Bell, Gear,
  ChatCircleDots, BellRinging,
} from "@phosphor-icons/react"

// ── StatusBar ────────────────────────────────────────────────
export function StatusBar({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 10_000)
    return () => clearInterval(id)
  }, [])

  const color = theme === "dark" ? "white" : "#171717"

  return (
    <>
      <div className="absolute top-4 left-7 z-20 text-[13px] font-semibold" style={{ color }}>
        {time || "9:41"}
      </div>
      <div className="absolute top-4 right-6 z-20 flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[3, 4, 4, 3].map((h, i) => (
            <div key={i} className="w-[3px] rounded-sm" style={{ height: h, background: color, opacity: i === 3 ? 0.4 : 1 }} />
          ))}
        </div>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={color}>
          <path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.2 1.2 5 0 8 0s5.8 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4zM8 6.4c-1.4 0-2.6.6-3.4 1.4L3 6.2C4.2 5 6 4.4 8 4.4s3.8.6 5 1.8L11.4 7.8C10.6 7 9.4 6.4 8 6.4zM8 10.4c-.8 0-1.4.4-1.8.8L8 12l1.8-1c-.4-.4-1-.6-1.8-.6z"/>
        </svg>
        <div className="flex items-center gap-0.5">
          <div className="h-3 rounded-sm" style={{ width: 22, background: color }} />
          <div className="h-1.5 rounded-sm" style={{ width: 3, background: color, opacity: 0.5 }} />
        </div>
      </div>
    </>
  )
}

// ── BottomNav ────────────────────────────────────────────────
// active prop: 디자인 뷰어에서 강제 지정. 실제 앱에서는 usePathname 자동 감지.
export function BottomNav({
  active,
  pendingCount = 0,
}: {
  active?: string
  pendingCount?: number
}) {
  const pathname = usePathname()

  const tabs = [
    { id: "home",     href: "/home",     icon: House,         label: "홈" },
    { id: "calendar", href: "/calendar", icon: CalendarBlank, label: "일정" },
    { id: "alerts",   href: "/alerts",   icon: Bell,          label: "알림" },
    { id: "settings", href: "/settings", icon: Gear,          label: "설정" },
  ]

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-2 pt-4 border-t border-[#E5E5E5]"
      style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)", height: 82 }}
    >
      {tabs.map(({ id, href, icon: Icon, label }) => {
        const isActive = active
          ? active === id
          : pathname.startsWith("/" + id)
        return (
          <Link
            key={id}
            href={href}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 relative"
          >
            <span className="relative">
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                className={isActive ? "text-[#EAB308]" : "text-[#A3A3A3]"}
              />
              {id === "alerts" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium ${isActive ? "text-[#EAB308]" : "text-[#A3A3A3]"}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// ── EventDetectionCard ───────────────────────────────────────
export function EventDetectionCard({
  room,
  participants,
  datetime,
  preview,
  href,
}: {
  room: string
  participants: number
  datetime: string
  preview: string
  href?: string
}) {
  const content = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5] border-l-[3px] border-l-[#EAB308] relative">
      <div className="absolute top-4 right-4">
        <ChatCircleDots size={18} weight="fill" className="text-[#EAB308]" />
      </div>
      <p className="font-semibold text-[14px] text-[#171717] pr-6">{room}</p>
      <p className="text-[12px] text-[#737373] mt-0.5">참여자 {participants}명</p>
      <p className="text-[13px] font-semibold text-[#EAB308] mt-2">{datetime}</p>
      <p className="text-[12px] text-[#737373] mt-1 truncate">{preview}</p>
      <span className="mt-2 text-[12px] text-[#EAB308] font-semibold">확인하기 →</span>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

// ── SmartAlertBadge ──────────────────────────────────────────
export function SmartAlertBadge({ label, important = false }: { label: string; important?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        important
          ? "border-[#EAB308] text-[#EAB308] bg-white"
          : "border-[#E5E5E5] text-[#737373] bg-[#F5F5F5]"
      }`}
    >
      <BellRinging size={12} weight={important ? "fill" : "regular"} />
      {label}
    </span>
  )
}

// ── Avatar ───────────────────────────────────────────────────
export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-[11px]", md: "w-9 h-9 text-[13px]", lg: "w-12 h-12 text-[16px]" }
  return (
    <div className={`${sizes[size]} rounded-full bg-[#EAB308] flex items-center justify-center font-bold text-[#1A1A1A] flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 rounded-full border-2 border-[#E5E5E5] border-t-[#EAB308] animate-spin" />
    </div>
  )
}

// ── Toggle ───────────────────────────────────────────────────
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-200 ${on ? "bg-[#EAB308]" : "bg-[#E5E5E5]"}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  )
}

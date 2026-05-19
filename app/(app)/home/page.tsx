"use client"

import { useEffect, useState } from "react"
import { Bell, Gear, CalendarCheck, ChatCircleDots, CheckCircle } from "@phosphor-icons/react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { BottomNav, EventDetectionCard, Avatar, StatusBar } from "@/components/tcm/shared"
import { MOCK_USER, MOCK_DETECTIONS, MOCK_STATS, MOCK_EVENTS } from "@/lib/mock-data"
import type { User, CalendarEvent, DetectedEvent } from "@/lib/types/database"

type Stats = { thisWeek: number; pending: number; savedTotal: number }

function getWeekDates() {
  const today = new Date()
  const dow = (today.getDay() + 6) % 7 // 월=0
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    return d
  })
}

function fmtDetectedDate(det: DetectedEvent) {
  if (!det.extracted_date) return "날짜 미정"
  const d = new Date(det.extracted_date)
  const label = d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
  if (!det.extracted_time) return label
  const [h, m] = det.extracted_time.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "오후" : "오전"
  const h12 = hour > 12 ? hour - 12 : hour || 12
  return `${label} ${ampm} ${h12}:${m}`
}

export default function HomePage() {
  const [user, setUser] = useState<User>(MOCK_USER)
  const [stats, setStats] = useState<Stats>(MOCK_STATS)
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [detections, setDetections] = useState<DetectedEvent[]>(MOCK_DETECTIONS)

  useEffect(() => {
    async function tryLoadReal() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        const today = new Date()
        const dow = (today.getDay() + 6) % 7
        const mon = new Date(today); mon.setDate(today.getDate() - dow)
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
        const fmt = (d: Date) => d.toISOString().split("T")[0]

        const [profileRes, weekRes, pendingRes, totalRes] = await Promise.all([
          supabase.from("users").select("*").eq("id", authUser.id).single(),
          supabase.from("calendar_events").select("*").eq("user_id", authUser.id)
            .gte("event_date", fmt(mon)).lte("event_date", fmt(sun)),
          supabase.from("detected_events").select("*").eq("user_id", authUser.id)
            .eq("status", "pending").order("detected_at", { ascending: false }).limit(3),
          supabase.from("calendar_events").select("id", { count: "exact" })
            .eq("user_id", authUser.id).eq("is_ai_generated", true),
        ])

        if (profileRes.data) setUser(profileRes.data as User)
        const wEvents = (weekRes.data ?? []) as CalendarEvent[]
        if (wEvents.length) setWeekEvents(wEvents)
        const dets = (pendingRes.data ?? []) as DetectedEvent[]
        if (dets.length) setDetections(dets)
        setStats({
          thisWeek: wEvents.length || MOCK_STATS.thisWeek,
          pending: dets.length,
          savedTotal: totalRes.count ?? MOCK_STATS.savedTotal,
        })
      } catch {
        // Supabase 연결 실패 시 목업 데이터 유지
      }
    }
    tryLoadReal()
  }, [])

  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7
  const weekDays = ["월", "화", "수", "목", "금", "토", "일"]
  const weekDates = getWeekDates()

  function hasEvent(d: Date) {
    const iso = d.toISOString().split("T")[0]
    return weekEvents.some(e => e.event_date === iso)
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden">
      <div className="h-11" />
      <StatusBar />

      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar initials={user.name.slice(0, 2)} size="md" />
          <div>
            <p className="text-[14px] font-semibold text-[#171717]">
              안녕하세요, {user.name}님 👋
            </p>
            <p className="text-[12px] text-[#737373]">오늘도 좋은 하루 되세요</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/alerts" className="relative">
            <Bell size={22} weight="regular" className="text-[#171717]" />
            {stats.pending > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </Link>
          <Link href="/settings">
            <Gear size={22} weight="regular" className="text-[#171717]" />
          </Link>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col gap-4">

        {/* AI 모니터링 카드 */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)", minHeight: 110 }}
        >
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-12 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute left-1/2 -bottom-8 w-28 h-28 rounded-full bg-white/5" />
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <span className="text-[17px] font-bold text-white">AI 모니터링 중</span>
              </div>
              <p className="text-[13px] text-yellow-100 leading-relaxed">
                카카오톡 대화를 실시간으로 분석하고 있어요
              </p>
              <p className="text-[11px] text-yellow-200/70 mt-1.5">오늘 {detections.length}건 감지됨</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 ml-4">
              <div className="w-13 h-7 rounded-full bg-white flex items-center px-1" style={{ width: 52 }}>
                <div className="w-5 h-5 rounded-full bg-[#EAB308] ml-auto shadow-sm" />
              </div>
              <span className="text-[11px] text-yellow-100 font-medium">활성화됨</span>
            </div>
          </div>
        </div>

        {/* 통계 3칸 */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: CalendarCheck,  label: "이번 주 일정", value: stats.thisWeek,   color: "#EAB308" },
            { icon: ChatCircleDots, label: "감지된 약속",  value: stats.pending,    color: "#F59E0B" },
            { icon: CheckCircle,    label: "저장 완료",    value: stats.savedTotal, color: "#10B981" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-[#E5E5E5] flex flex-col items-center gap-1.5">
              <Icon size={20} weight="fill" style={{ color }} />
              <span className="text-[17px] font-black text-[#171717]">{value}</span>
              <span className="text-[10px] text-[#737373] text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* 이번 주 캘린더 스트립 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold text-[#171717]">이번 주 일정</span>
            <Link href="/calendar">
              <span className="text-[12px] text-[#EAB308] font-semibold">
                {today.getFullYear()}년 {today.getMonth() + 1}월
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-medium ${
                  i === 6 ? "text-red-400" : i === 5 ? "text-blue-400" : "text-[#737373]"
                }`}>{day}</span>
                <Link href={`/calendar?date=${weekDates[i].toISOString().split("T")[0]}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                    i === todayIdx ? "bg-[#EAB308] text-[#1A1A1A]" : "text-[#171717]"
                  }`}>
                    {weekDates[i].getDate()}
                  </div>
                </Link>
                <div className={`w-1 h-1 rounded-full ${hasEvent(weekDates[i]) ? "bg-[#EAB308]" : "bg-transparent"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* 최근 감지된 약속 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-[#171717]">최근 감지된 약속</span>
            <Link href="/alerts">
              <span className="text-[12px] text-[#EAB308] font-semibold">전체보기</span>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {detections.map(det => (
              <EventDetectionCard
                key={det.id}
                room={det.extracted_title ?? "카카오톡 채팅방"}
                participants={(det.extracted_participants as string[] | null)?.length ?? 2}
                datetime={fmtDetectedDate(det)}
                preview={det.extracted_purpose ?? "약속이 감지됐어요"}
                href={`/alerts/${det.id}`}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav pendingCount={stats.pending} />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft, Sparkle, CalendarBlank, Clock, MapPin, Users, Tag, Spinner,
} from "@phosphor-icons/react"
import { supabase, saveDetectedEventToCalendar, dismissDetectedEvent } from "@/lib/supabase"
import { Avatar, StatusBar } from "@/components/tcm/shared"
import { MOCK_DETECTIONS } from "@/lib/mock-data"
import type { DetectedEvent } from "@/lib/types/database"

function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}

function fmtDate(d: string | null) {
  if (!d) return "날짜 미정"
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
}

export default function AlertDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [det, setDet] = useState<DetectedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const mock = MOCK_DETECTIONS.find(d => d.id === id)
    if (mock) { setDet(mock); setLoading(false); return }

    supabase.from("detected_events").select("*").eq("id", id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError("감지 이벤트를 찾을 수 없습니다."); setLoading(false); return }
        setDet(data as DetectedEvent)
        setLoading(false)
      })
  }, [id])

  async function handleSave() {
    if (!det) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")
      const saved = await saveDetectedEventToCalendar(det.id, user.id)
      router.replace(`/events/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다")
      setSaving(false)
    }
  }

  async function handleDismiss() {
    if (!det) return
    setDismissing(true)
    try {
      await dismissDetectedEvent(det.id)
      router.replace("/alerts")
    } catch {
      setDismissing(false)
    }
  }

  async function handleSaveAndEdit() {
    if (!det) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")
      const saved = await saveDetectedEventToCalendar(det.id, user.id)
      router.replace(`/events/${saved.id}?edit=true`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
      setSaving(false)
    }
  }

  const confidencePct = det ? Math.round(det.ai_confidence * 100) : 0

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#FAFAFA]">
        <div className="h-11" /><StatusBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] border-t-[#EAB308] animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !det) {
    return (
      <div className="flex flex-col h-full bg-[#FAFAFA]">
        <div className="h-11" /><StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-[14px] text-[#737373] text-center">{error || "이벤트를 찾을 수 없습니다"}</p>
          <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-[#EAB308] text-[#1A1A1A] text-[13px] font-bold">
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      <div className="h-11" />
      <StatusBar />

      {/* 딤 배경 */}
      <div className="flex-1 bg-black/30 relative flex flex-col justify-end">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={16} weight="bold" className="text-white" />
        </button>

        {/* Bottom sheet */}
        <div className="bg-white rounded-t-3xl overflow-hidden max-h-[85%]">
          {/* 드래그 핸들 */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-32px)] px-5 pb-6 flex flex-col gap-5">
            {/* 헤더 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FEF9C3] flex items-center justify-center">
                <Sparkle size={18} weight="fill" className="text-[#EAB308]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#171717]">새로운 약속이 감지됐어요!</p>
                <p className="text-[12px] text-[#737373]">
                  {new Date(det.detected_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 감지
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EAB308] text-[#1A1A1A] text-[11px] font-bold">
                AI 신뢰도 {confidencePct}%
              </span>
            </div>

            {/* 참여자 미리보기 */}
            {det.extracted_participants && det.extracted_participants.length > 0 && (
              <div className="bg-[#F5F5F5] rounded-2xl p-3 flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#737373] mb-1">👥 참여자</p>
                <div className="flex gap-2 flex-wrap">
                  {(det.extracted_participants as string[]).map((name) => (
                    <div key={name} className="flex items-center gap-1.5 bg-white rounded-full px-2.5 py-1 shadow-sm">
                      <Avatar initials={name.slice(0, 1)} size="sm" />
                      <span className="text-[12px] font-medium text-[#171717]">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 분석 결과 */}
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-bold text-[#171717]">AI 분석 결과</p>
              {[
                { icon: CalendarBlank, label: "날짜", value: fmtDate(det.extracted_date) },
                { icon: Clock,         label: "시간", value: fmtTime(det.extracted_time) || "시간 미정" },
                { icon: MapPin,        label: "장소", value: det.extracted_location || "장소 미정" },
                { icon: Users,         label: "참여자", value: (det.extracted_participants as string[] | null)?.join(", ") || "미정" },
                { icon: Tag,           label: "목적", value: det.extracted_purpose || "미정" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-[#F5F5F5] last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF9C3] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} weight="fill" className="text-[#EAB308]" />
                  </div>
                  <span className="text-[12px] text-[#737373] w-12 flex-shrink-0">{label}</span>
                  <span className="text-[13px] font-medium text-[#171717]">{value}</span>
                </div>
              ))}
            </div>

            {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveAndEdit}
                disabled={saving || dismissing}
                className="flex-1 py-3.5 rounded-2xl border-2 border-[#EAB308] text-[#EAB308] text-[14px] font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                수정 후 저장
              </button>
              <button
                onClick={handleSave}
                disabled={saving || dismissing}
                className="flex-1 py-3.5 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[14px] font-bold shadow-md shadow-yellow-200 disabled:opacity-50 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                {saving && <Spinner size={16} className="animate-spin" />}
                바로 저장
              </button>
            </div>

            <button
              onClick={handleDismiss}
              disabled={saving || dismissing}
              className="text-[13px] text-[#A3A3A3] text-center py-1 disabled:opacity-50"
            >
              {dismissing ? "처리 중..." : "무시하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

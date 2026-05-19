"use client"

import { useEffect, useState } from "react"
import { BellRinging, ChatCircleDots, Plus } from "@phosphor-icons/react"
import { supabase } from "@/lib/supabase"
import { BottomNav, EventDetectionCard, Spinner, StatusBar } from "@/components/tcm/shared"
import { MOCK_DETECTIONS } from "@/lib/mock-data"
import type { DetectedEvent } from "@/lib/types/database"

function fmtDatetime(det: DetectedEvent) {
  if (!det.extracted_date) return "날짜 미정"
  const d = new Date(det.extracted_date)
  const label = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })
  const time = det.extracted_time ? ` ${det.extracted_time.slice(0, 5)}` : ""
  return label + time
}

export default function AlertsPage() {
  const [detections, setDetections] = useState<DetectedEvent[]>(MOCK_DETECTIONS)
  const [loading] = useState(false)
  const [adding, setAdding] = useState(false)

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("detected_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("detected_at", { ascending: false })
      if (data) setDetections(data as DetectedEvent[])
    } catch {
      // 목업 데이터 유지
    }
  }

  useEffect(() => { load() }, [])

  // 테스트용: 샘플 감지 이벤트 생성
  async function addSampleDetection() {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAdding(false); return }

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    await supabase.from("detected_events").insert({
      user_id: user.id,
      ai_confidence: 0.94,
      status: "pending",
      extracted_title: "강남역 저녁 약속",
      extracted_date: nextWeek.toISOString().split("T")[0],
      extracted_time: "19:00:00",
      extracted_location: "강남역 2번 출구",
      extracted_participants: ["김민준", "이서연", "박지훈"],
      extracted_purpose: "저녁 식사",
    })
    await load()
    setAdding(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      <div className="h-11" />
      <StatusBar />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-[18px] font-black text-[#171717]">알림</h1>
          {!loading && detections.length > 0 && (
            <p className="text-[12px] text-[#737373]">감지된 약속 {detections.length}건</p>
          )}
        </div>
        {/* 테스트 감지 추가 버튼 */}
        <button
          onClick={addSampleDetection}
          disabled={adding}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FEF9C3] text-[#A16207] text-[12px] font-semibold active:scale-95 transition-transform disabled:opacity-50"
        >
          {adding ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#A16207] border-t-transparent animate-spin" />
          ) : (
            <Plus size={14} weight="bold" />
          )}
          테스트 감지
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col gap-3">
        {loading ? (
          <Spinner />
        ) : detections.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20">
            <div className="w-20 h-20 rounded-3xl bg-[#FEF9C3] flex items-center justify-center">
              <BellRinging size={36} weight="fill" className="text-[#EAB308]" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-[#171717]">감지된 약속이 없어요</p>
              <p className="text-[13px] text-[#737373] mt-1 leading-relaxed">
                카카오톡 대화에서 약속이 감지되면<br />여기에 표시됩니다
              </p>
            </div>
            <button
              onClick={addSampleDetection}
              disabled={adding}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-dashed border-[#EAB308] text-[#EAB308] text-[13px] font-semibold active:scale-95 transition-transform"
            >
              <ChatCircleDots size={16} weight="fill" />
              샘플 감지 이벤트 추가해보기
            </button>
          </div>
        ) : (
          <>
            {detections.map((det) => (
              <EventDetectionCard
                key={det.id}
                room={det.extracted_title ?? "카카오톡 채팅방"}
                participants={(det.extracted_participants ?? []).length || 2}
                datetime={fmtDatetime(det)}
                preview={det.extracted_purpose ?? "약속이 감지됐어요"}
                href={`/alerts/${det.id}`}
              />
            ))}

            <p className="text-center text-[11px] text-[#A3A3A3] py-2">
              모두 확인 완료하면 사라집니다
            </p>
          </>
        )}
      </div>

      <BottomNav pendingCount={detections.length} />
    </div>
  )
}

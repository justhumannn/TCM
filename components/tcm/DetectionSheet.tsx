"use client"

import { Sparkle, CalendarBlank, Clock, MapPin, Users, Tag } from "@phosphor-icons/react"
import { Avatar } from "./shared"

function ChatBubble({ sender, text, side, highlight }: { sender?: string; text: string; side: "left" | "right"; highlight?: string[] }) {
  const renderText = (t: string): React.ReactNode[] => {
    if (!highlight?.length) return [t]
    let result: React.ReactNode[] = [t]
    highlight.forEach((kw) => {
      result = result.flatMap((part): React.ReactNode[] => {
        if (typeof part !== "string") return [part]
        const idx = part.indexOf(kw)
        if (idx === -1) return [part]
        return [
          part.slice(0, idx),
          <mark key={kw} className="bg-[#FEF08A] text-[#1A1A1A] rounded px-0.5 not-italic font-semibold">{kw}</mark>,
          part.slice(idx + kw.length),
        ]
      })
    })
    return result
  }

  return (
    <div className={`flex gap-2 ${side === "right" ? "flex-row-reverse" : "flex-row"}`}>
      {side === "left" && (
        <Avatar initials={sender?.slice(0, 2) ?? "??"} size="sm" />
      )}
      <div className={`flex flex-col gap-0.5 max-w-[72%] ${side === "right" ? "items-end" : "items-start"}`}>
        {side === "left" && sender && (
          <span className="text-[11px] text-[#737373] font-medium px-1">{sender}</span>
        )}
        <div className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
          side === "right"
            ? "bg-[#FEF08A] text-[#1A1A1A] rounded-tr-sm"
            : "bg-[#F5F5F5] text-[#171717] rounded-tl-sm"
        }`}>
          {renderText(text)}
        </div>
        <span className="text-[10px] text-[#A3A3A3] px-1">오후 6:32</span>
      </div>
    </div>
  )
}

export default function DetectionSheet() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative">
      {/* Safe area top */}
      <div className="h-11" />

      {/* Dimmed top area */}
      <div className="flex-1 bg-black/30 relative">
        {/* Drag handle area */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
          </div>

          <div className="px-5 pb-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FEF9C3] flex items-center justify-center">
                <Sparkle size={18} weight="fill" className="text-[#EAB308]" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#171717]">새로운 약속이 감지됐어요!</p>
                <p className="text-[12px] text-[#737373]">대학 동기 단톡방</p>
              </div>
              <div className="ml-auto">
                <span className="px-2.5 py-1 rounded-full bg-[#EAB308] text-[#1A1A1A] text-[11px] font-bold">AI 신뢰도 94%</span>
              </div>
            </div>

            {/* Chat preview */}
            <div className="bg-[#F5F5F5] rounded-2xl p-3 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-[#737373] mb-1">💬 대화 미리보기</p>
              <ChatBubble
                sender="이서연"
                text="다들 내일 저녁 시간 돼?"
                side="left"
                highlight={["내일 저녁"]}
              />
              <ChatBubble
                text="나 가능! 강남역 어때?"
                side="right"
                highlight={["강남역"]}
              />
              <ChatBubble
                sender="박지훈"
                text="좋아, 강남역 2번 출구 오후 7시에 보자!"
                side="left"
                highlight={["강남역 2번 출구", "오후 7시"]}
              />
            </div>

            {/* AI analysis */}
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-bold text-[#171717]">AI 분석 결과</p>
              {[
                { icon: CalendarBlank, label: "날짜", value: "2025년 6월 3일 (화)" },
                { icon: Clock, label: "시간", value: "오후 7:00" },
                { icon: MapPin, label: "장소", value: "강남역 2번 출구" },
                { icon: Users, label: "참여자", value: "김민준, 이서연, 박지훈" },
                { icon: Tag, label: "목적", value: "저녁 식사" },
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

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-2xl border-2 border-[#EAB308] text-[#EAB308] text-[14px] font-bold">
                수정 후 저장
              </button>
              <button className="flex-1 py-3.5 rounded-2xl bg-[#EAB308] text-[#1A1A1A] text-[14px] font-bold shadow-md shadow-yellow-200">
                바로 저장
              </button>
            </div>
            <button className="text-[13px] text-[#A3A3A3] text-center py-1">무시하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const API_URL = "https://api.anthropic.com/v1/messages"

export interface ExtractedEvent {
  title: string | null
  date: string | null       // YYYY-MM-DD
  time: string | null       // HH:mm:ss
  location: string | null
  participants: string[] | null
  purpose: string | null
  confidence: number
}

export async function detectEventFromText(text: string, apiKey: string): Promise<ExtractedEvent> {
  const today = new Date().toISOString().split("T")[0]

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `오늘 날짜: ${today}

다음 카카오톡 대화에서 약속/일정 정보를 추출해주세요. 반드시 JSON만 응답하세요.

대화:
"""
${text}
"""

JSON 형식 (다른 텍스트 없이 JSON만):
{
  "title": "약속 제목 (없으면 null)",
  "date": "YYYY-MM-DD (없으면 null, 상대적 표현은 오늘 기준으로 변환)",
  "time": "HH:mm:ss (없으면 null)",
  "location": "장소 (없으면 null)",
  "participants": ["이름1", "이름2"] (없으면 null),
  "purpose": "대화 내용 한 줄 요약",
  "confidence": 0.0에서 1.0 사이 숫자 (약속일 확신도)
}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Claude API 오류 (${res.status}): ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ""

  // JSON 파싱 - 코드블록 제거
  const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
  try {
    return JSON.parse(cleaned) as ExtractedEvent
  } catch {
    throw new Error(`AI 응답 파싱 실패: ${raw.slice(0, 100)}`)
  }
}

import { NativeModules, DeviceEventEmitter, Platform, NativeEventEmitter } from "react-native"
import { dbCreateDetection } from "./db"
import { scheduleDetectionNotification } from "./notifications"

const { KakaoListener } = NativeModules

const NGROK_URL = "https://exhaust-amperage-fervor.ngrok-free.dev"

// 메시지 중복 방지 캐시 (60초)
const recentMessages = new Map<string, number>()

export interface KakaoMessage {
  sender: string
  message: string
  room: string
  timestamp: number
  source: "notification" | "accessibility"
}

export interface AiEventResult {
  is_appointment: boolean
  title?: string
  date?: string     // YYYY-MM-DD
  time?: string     // HH:mm:ss
  location?: string
  participants?: string[]
  purpose?: string
  confidence: number
}

// ngrok 서버에 메시지 전송 → AI 분석 결과 수신
export async function sendToAi(msg: KakaoMessage): Promise<AiEventResult | null> {
  try {
    const res = await fetch(`${NGROK_URL}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        sender: msg.sender,
        message: msg.message,
        room: msg.room,
        timestamp: msg.timestamp,
      }),
    })

    if (!res.ok) {
      console.warn("[TCM] AI API error:", res.status)
      return null
    }

    const data = await res.json()
    return data as AiEventResult
  } catch (e) {
    console.warn("[TCM] AI API unreachable:", e)
    return null
  }
}

// AI 결과를 DB에 저장하고 알림 발송
async function processAiResult(result: AiEventResult, msg: KakaoMessage) {
  if (!result.is_appointment || result.confidence < 0.6) return

  const det = dbCreateDetection({
    ai_confidence: result.confidence,
    extracted_title: result.title ?? msg.room,
    extracted_date: result.date ?? null,
    extracted_time: result.time ?? null,
    extracted_location: result.location ?? null,
    extracted_participants: result.participants ?? null,
    extracted_purpose: result.purpose ?? msg.message,
  })

  await scheduleDetectionNotification(
    `${result.title ?? "새 약속"} — ${result.location ?? "장소 미정"}`
  ).catch(() => {})

  console.log("[TCM] 약속 감지 저장:", det.id)
  return det
}

// 메시지 처리 (중복 제거 포함)
async function handleMessage(msg: KakaoMessage) {
  const key = `${msg.room}:${msg.message}`
  const now = Date.now()
  const last = recentMessages.get(key)
  if (last && now - last < 60_000) return  // 60초 내 중복 무시
  recentMessages.set(key, now)

  const result = await sendToAi(msg)
  if (result) await processAiResult(result, msg)
}

// Android 전용 — 리스너 시작
export async function startKakaoListener(): Promise<boolean> {
  if (Platform.OS !== "android" || !KakaoListener) return false

  try {
    await KakaoListener.startListening()
    DeviceEventEmitter.addListener("KakaoMessage", (msg: KakaoMessage) => {
      handleMessage(msg).catch(console.warn)
    })
    return true
  } catch (e) {
    console.warn("[TCM] KakaoListener start error:", e)
    return false
  }
}

// 권한 상태 확인
export async function getPermissionStatus(): Promise<{
  notification: boolean
  accessibility: boolean
}> {
  if (Platform.OS !== "android" || !KakaoListener) {
    return { notification: false, accessibility: false }
  }
  const [notification, accessibility] = await Promise.all([
    KakaoListener.checkNotificationPermission(),
    KakaoListener.checkAccessibilityPermission(),
  ])
  return { notification, accessibility }
}

export function openNotificationSettings() {
  if (Platform.OS === "android" && KakaoListener) {
    KakaoListener.openNotificationSettings()
  }
}

export function openAccessibilitySettings() {
  if (Platform.OS === "android" && KakaoListener) {
    KakaoListener.openAccessibilitySettings()
  }
}

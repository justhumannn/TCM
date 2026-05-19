import * as Notifications from "expo-notifications"
import type { CalendarEvent } from "./types"

let handlerSet = false
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  })
  handlerSet = true
} catch {
  // Expo Go (SDK 53+) does not support notifications on Android — ignored
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!handlerSet) return false
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    if (existing === "granted") return true
    const { status } = await Notifications.requestPermissionsAsync()
    return status === "granted"
  } catch {
    return false
  }
}

export async function scheduleEventNotification(
  event: CalendarEvent,
  minutesBefore = 30
): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission()
    if (!granted) return null

    const eventDate = new Date(`${event.event_date}T${event.event_time ?? "09:00:00"}`)
    const triggerDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000)

    if (triggerDate <= new Date()) return null

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 ${event.title}`,
        body: [
          minutesBefore < 60 ? `${minutesBefore}분 후 시작` : "1시간 후 시작",
          event.location ? `📍 ${event.location}` : null,
        ]
          .filter(Boolean)
          .join("  "),
        data: { eventId: event.id },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    })

    return id
  } catch {
    return null
  }
}

export async function cancelEventNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  } catch {}
}

export async function scheduleDetectionNotification(title: string): Promise<void> {
  try {
    const granted = await requestNotificationPermission()
    if (!granted) return

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✨ 새 약속 감지됨",
        body: title,
        sound: true,
      },
      trigger: null,
    })
  } catch {}
}

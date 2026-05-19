import { useEffect } from "react"
import { Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { initDb } from "@/lib/db"
import { requestNotificationPermission } from "@/lib/notifications"

export default function RootLayout() {
  useEffect(() => {
    try { initDb() } catch (e) { console.warn("DB init error:", e) }
    requestNotificationPermission().catch(() => {})
  }, [])

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="detect" options={{ presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  )
}

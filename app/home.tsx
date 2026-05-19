import { useEffect, useState, useCallback } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, AppState,
} from "react-native"
import { useRouter } from "expo-router"
import {
  Sparkle, CalendarBlank, BellRinging, Clock, MapPin,
  ChatCircle, Warning, CheckCircle, ArrowRight,
} from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BottomNav, Avatar } from "@/components/shared"
import { C } from "@/lib/theme"
import { MOCK_EVENTS, MOCK_DETECTIONS, MOCK_STATS } from "@/lib/mock-data"
import { dbGetEvents, dbGetPendingDetections } from "@/lib/db"
import { getPermissionStatus } from "@/lib/kakao-service"
import type { CalendarEvent, DetectedEvent } from "@/lib/types"

function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}

function fmtDetDate(d: string | null) {
  if (!d) return "날짜 미정"
  const dt = new Date(d)
  return dt.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
}

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const today = new Date()
  const todayISO = today.toISOString().split("T")[0]
  const [year] = useState(today.getFullYear())
  const [month] = useState(today.getMonth() + 1)

  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [detections, setDetections] = useState<DetectedEvent[]>(MOCK_DETECTIONS)
  const [kakaoPerms, setKakaoPerms] = useState<{ notification: boolean; accessibility: boolean }>({
    notification: false, accessibility: false,
  })

  const refreshPerms = useCallback(async () => {
    try {
      const p = await getPermissionStatus()
      setKakaoPerms(p)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const e = dbGetEvents(year, month)
      if (e.length) setEvents(e)
    } catch {}
    try {
      const d = dbGetPendingDetections()
      if (d.length) setDetections(d)
    } catch {}
    refreshPerms()
  }, [])

  useEffect(() => {
    const sub = AppState.addEventListener("change", state => {
      if (state === "active") refreshPerms()
    })
    return () => sub.remove()
  }, [refreshPerms])

  const upcomingEvents = events
    .filter(e => e.event_date >= todayISO)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 3)

  const pendingCount = detections.filter(d => d.status === "pending").length

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>안녕하세요 👋</Text>
          <Text style={s.date}>
            {today.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
          </Text>
        </View>
        <Avatar initials="김민" size="lg" />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AI 모니터링 배너 */}
        <TouchableOpacity
          style={s.banner}
          onPress={() => router.push("/alerts")}
          activeOpacity={0.85}
        >
          <View style={s.bannerLeft}>
            <View style={s.bannerIconWrap}>
              <Sparkle size={22} weight="fill" color={C.yellow} />
            </View>
            <View style={s.bannerTextWrap}>
              <Text style={s.bannerTitle}>AI 모니터링 중</Text>
              <Text style={s.bannerSub}>오늘 {pendingCount}건 감지됨</Text>
            </View>
          </View>
          <View style={s.bannerRight}>
            <Text style={s.bannerBadge}>{pendingCount}</Text>
            <Text style={s.bannerBadgeLabel}>대기 중</Text>
          </View>
        </TouchableOpacity>

        {/* 카카오톡 모니터링 상태 */}
        {(() => {
          const allOk = kakaoPerms.notification && kakaoPerms.accessibility
          return (
            <TouchableOpacity
              style={[s.kakaoCard, allOk && s.kakaoCardOk]}
              onPress={() => router.push("/permissions" as any)}
              activeOpacity={0.85}
            >
              <View style={[s.kakaoIcon, allOk && s.kakaoIconOk]}>
                <ChatCircle size={20} weight="fill" color={allOk ? C.greenDark : "#D97706"} />
              </View>
              <View style={s.kakaoInfo}>
                <Text style={s.kakaoTitle}>카카오톡 자동 감지</Text>
                <Text style={s.kakaoSub}>
                  {allOk ? "알림·접근성 권한 허용됨 — 실시간 감지 중" : "권한 설정이 필요해요"}
                </Text>
              </View>
              {allOk ? (
                <CheckCircle size={20} weight="fill" color={C.green} />
              ) : (
                <View style={s.kakaoSetupBtn}>
                  <Warning size={13} weight="fill" color="#D97706" />
                  <Text style={s.kakaoSetupText}>설정</Text>
                  <ArrowRight size={12} weight="bold" color="#D97706" />
                </View>
              )}
            </TouchableOpacity>
          )
        })()}

        {/* 통계 */}
        <View style={s.statsRow}>
          {[
            { label: "이번 주", value: MOCK_STATS.thisWeek },
            { label: "대기 중", value: pendingCount },
            { label: "저장 완료", value: MOCK_STATS.savedTotal },
          ].map(({ label, value }) => (
            <View key={label} style={s.statCard}>
              <Text style={s.statValue}>{value}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* 다가오는 일정 */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <CalendarBlank size={16} weight="fill" color={C.yellow} />
            <Text style={s.sectionTitle}>다가오는 일정</Text>
            <TouchableOpacity onPress={() => router.push("/calendar")} style={s.seeAll}>
              <Text style={s.seeAllText}>전체 보기</Text>
            </TouchableOpacity>
          </View>

          {upcomingEvents.length === 0 ? (
            <Text style={s.empty}>다가오는 일정이 없어요</Text>
          ) : (
            upcomingEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={s.eventCard}
                onPress={() => router.push(`/events/${event.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={[s.eventStripe, { backgroundColor: event.is_ai_generated ? C.yellow : C.midGray }]} />
                <View style={s.eventBody}>
                  <Text style={s.eventTitle}>{event.title}</Text>
                  <View style={s.eventMeta}>
                    {event.event_time && (
                      <View style={s.metaItem}>
                        <Clock size={11} weight="fill" color={C.darkGray} />
                        <Text style={s.metaText}>{fmtTime(event.event_time)}</Text>
                      </View>
                    )}
                    {event.location && (
                      <View style={s.metaItem}>
                        <MapPin size={11} weight="fill" color={C.darkGray} />
                        <Text style={s.metaText} numberOfLines={1}>{event.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {event.is_ai_generated && (
                  <View style={s.aiTag}>
                    <Sparkle size={10} weight="fill" color={C.yellowDark} />
                    <Text style={s.aiTagText}>AI</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 감지된 알림 */}
        {detections.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <BellRinging size={16} weight="fill" color={C.yellow} />
              <Text style={s.sectionTitle}>감지된 약속</Text>
              <TouchableOpacity onPress={() => router.push("/alerts")} style={s.seeAll}>
                <Text style={s.seeAllText}>전체 보기</Text>
              </TouchableOpacity>
            </View>

            {detections.slice(0, 2).map(det => (
              <TouchableOpacity
                key={det.id}
                style={s.detCard}
                onPress={() => router.push(`/alerts/${det.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={s.detLeft}>
                  <Text style={s.detTitle}>{det.extracted_title ?? "카카오톡 채팅방"}</Text>
                  <Text style={s.detDate}>{fmtDetDate(det.extracted_date)}</Text>
                  <Text style={s.detPurpose} numberOfLines={1}>{det.extracted_purpose ?? "약속이 감지됐어요"}</Text>
                </View>
                <View style={s.confBadge}>
                  <Text style={s.confText}>{Math.round(det.ai_confidence * 100)}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNav pendingCount={pendingCount} />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  greeting: { fontSize: 13, color: C.darkGray, fontWeight: "500" },
  date: { fontSize: 18, fontWeight: "900", color: C.black, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  banner: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(234,179,8,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTextWrap: { gap: 2 },
  bannerTitle: { fontSize: 15, fontWeight: "700", color: C.white },
  bannerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  bannerRight: { alignItems: "center" },
  bannerBadge: { fontSize: 24, fontWeight: "900", color: C.yellow },
  bannerBadgeLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.lightGray,
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: "900", color: C.black },
  statLabel: { fontSize: 11, color: C.darkGray },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: C.black },
  seeAll: {},
  seeAllText: { fontSize: 12, color: C.yellow, fontWeight: "600" },
  empty: { fontSize: 13, color: C.midGray, textAlign: "center", paddingVertical: 16 },
  eventCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.lightGray,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  eventStripe: { width: 4 },
  eventBody: { flex: 1, padding: 12, gap: 6 },
  eventTitle: { fontSize: 14, fontWeight: "600", color: C.black },
  eventMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: C.darkGray },
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.yellowLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  aiTagText: { fontSize: 10, fontWeight: "700", color: C.yellowDark },
  detCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.lightGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detLeft: { flex: 1, gap: 4 },
  detTitle: { fontSize: 14, fontWeight: "700", color: C.black },
  detDate: { fontSize: 12, color: C.yellow, fontWeight: "600" },
  detPurpose: { fontSize: 12, color: C.darkGray },
  confBadge: {
    backgroundColor: C.yellow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confText: { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  kakaoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kakaoCardOk: { borderColor: C.green, backgroundColor: "#F0FDF4" },
  kakaoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoIconOk: { backgroundColor: C.greenLight },
  kakaoInfo: { flex: 1 },
  kakaoTitle: { fontSize: 13, fontWeight: "700", color: C.black },
  kakaoSub: { fontSize: 11, color: C.darkGray, marginTop: 2 },
  kakaoSetupBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  kakaoSetupText: { fontSize: 11, fontWeight: "700", color: "#D97706" },
})

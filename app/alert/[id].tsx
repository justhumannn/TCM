import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import {
  ArrowLeft, Sparkle, CalendarBlank, Clock, MapPin, Users, Tag,
} from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Avatar } from "@/components/shared"
import { C } from "@/lib/theme"
import { MOCK_DETECTIONS } from "@/lib/mock-data"
import { dbGetDetection, dbSaveDetection, dbDismissDetection } from "@/lib/db"
import { scheduleEventNotification } from "@/lib/notifications"
import type { DetectedEvent } from "@/lib/types"

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

export default function AlertDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [det, setDet] = useState<DetectedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const mock = MOCK_DETECTIONS.find(d => d.id === id)
    if (mock) { setDet(mock); setLoading(false); return }
    try {
      const data = dbGetDetection(id)
      setDet(data)
    } catch { setError("불러오기 실패") }
    setLoading(false)
  }, [id])

  function handleSave(edit = false) {
    if (!det) return
    setSaving(true)
    try {
      const event = dbSaveDetection(det.id)
      scheduleEventNotification(event, 30).catch(() => {})
      router.replace(edit ? `/events/${event.id}?edit=true` as any : `/events/${event.id}` as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다")
      setSaving(false)
    }
  }

  function handleDismiss() {
    if (!det) return
    Alert.alert("무시하기", "이 감지 이벤트를 무시할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "무시", style: "destructive", onPress: () => {
          try {
            dbDismissDetection(det.id)
            router.replace("/alerts")
          } catch {}
        },
      },
    ])
  }

  if (loading) return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.loadingCenter}>
        <Text style={s.loadingText}>불러오는 중...</Text>
      </View>
    </View>
  )

  if (!det || error) return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.loadingCenter}>
        <Text style={s.errorText}>{error || "이벤트를 찾을 수 없습니다"}</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const confPct = Math.round(det.ai_confidence * 100)

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.dimBg}>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => router.back()}
        >
          <ArrowLeft size={16} weight="bold" color={C.white} />
        </TouchableOpacity>

        <View style={s.sheet}>
          <View style={s.sheetHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
            {/* 헤더 */}
            <View style={s.sheetHeaderRow}>
              <View style={s.sparkleWrap}>
                <Sparkle size={18} weight="fill" color={C.yellow} />
              </View>
              <View style={s.sheetHeaderText}>
                <Text style={s.sheetTitle}>새로운 약속이 감지됐어요!</Text>
                <Text style={s.sheetSubtitle}>
                  {new Date(det.detected_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 감지
                </Text>
              </View>
              <View style={s.confBadge}>
                <Text style={s.confBadgeText}>AI {confPct}%</Text>
              </View>
            </View>

            {/* 참여자 */}
            {det.extracted_participants && det.extracted_participants.length > 0 && (
              <View style={s.participantsBox}>
                <Text style={s.participantsLabel}>👥 참여자</Text>
                <View style={s.participantsRow}>
                  {det.extracted_participants.map(name => (
                    <View key={name} style={s.participantChip}>
                      <Avatar initials={name.slice(0, 1)} size="sm" />
                      <Text style={s.participantName}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* AI 분석 결과 */}
            <Text style={s.resultTitle}>AI 분석 결과</Text>
            {[
              { icon: CalendarBlank, label: "날짜",   value: fmtDate(det.extracted_date) },
              { icon: Clock,         label: "시간",   value: fmtTime(det.extracted_time) || "시간 미정" },
              { icon: MapPin,        label: "장소",   value: det.extracted_location || "장소 미정" },
              { icon: Users,         label: "참여자", value: det.extracted_participants?.join(", ") || "미정" },
              { icon: Tag,           label: "목적",   value: det.extracted_purpose || "미정" },
            ].map(({ icon: Icon, label, value }) => (
              <View key={label} style={s.resultRow}>
                <View style={s.resultIconWrap}>
                  <Icon size={14} weight="fill" color={C.yellow} />
                </View>
                <Text style={s.resultLabel}>{label}</Text>
                <Text style={s.resultValue}>{value}</Text>
              </View>
            ))}

            {error ? <Text style={s.errorInline}>{error}</Text> : null}

            {/* 액션 버튼 */}
            <View style={s.actions}>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => handleSave(true)}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={s.editBtnText}>수정 후 저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.saveBtn}
                onPress={() => handleSave(false)}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={s.saveBtnText}>바로 저장</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.dismissBtn} onPress={handleDismiss} disabled={saving}>
              <Text style={s.dismissBtnText}>무시하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontSize: 14, color: C.darkGray },
  errorText: { fontSize: 14, color: C.darkGray, textAlign: "center" },
  backBtn: { backgroundColor: C.yellow, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  dimBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  closeBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.lightGray,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  sheetHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sparkleWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHeaderText: { flex: 1 },
  sheetTitle: { fontSize: 15, fontWeight: "700", color: C.black },
  sheetSubtitle: { fontSize: 12, color: C.darkGray, marginTop: 2 },
  confBadge: {
    backgroundColor: C.yellow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confBadgeText: { fontSize: 11, fontWeight: "700", color: "#1A1A1A" },
  participantsBox: {
    backgroundColor: C.ultraLight,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  participantsLabel: { fontSize: 11, fontWeight: "600", color: C.darkGray },
  participantsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  participantChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  participantName: { fontSize: 12, fontWeight: "500", color: C.black },
  resultTitle: { fontSize: 13, fontWeight: "700", color: C.black },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.ultraLight,
  },
  resultIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  resultLabel: { width: 44, fontSize: 12, color: C.darkGray },
  resultValue: { flex: 1, fontSize: 13, fontWeight: "500", color: C.black },
  errorInline: { fontSize: 12, color: "#EF4444", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
  editBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.yellow,
    alignItems: "center",
  },
  editBtnText: { fontSize: 14, fontWeight: "700", color: C.yellow },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: C.yellow,
    alignItems: "center",
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  dismissBtn: { alignItems: "center", paddingVertical: 4 },
  dismissBtnText: { fontSize: 13, color: C.midGray },
})

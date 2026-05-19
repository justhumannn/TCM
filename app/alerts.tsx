import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { BellRinging, ChatCircleDots, Plus } from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BottomNav, EventDetectionCard, Spinner } from "@/components/shared"
import { C } from "@/lib/theme"
import { MOCK_DETECTIONS } from "@/lib/mock-data"
import { dbGetPendingDetections, dbCreateDetection } from "@/lib/db"
import type { DetectedEvent } from "@/lib/types"

function fmtDatetime(det: DetectedEvent) {
  if (!det.extracted_date) return "날짜 미정"
  const d = new Date(det.extracted_date)
  const label = d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
  if (!det.extracted_time) return label
  const [h, m] = det.extracted_time.split(":")
  const hour = parseInt(h)
  return `${label} ${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}

export default function AlertsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [detections, setDetections] = useState<DetectedEvent[]>(MOCK_DETECTIONS)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    try {
      const data = dbGetPendingDetections()
      if (data.length) setDetections(data)
    } catch {}
  }, [])

  function addSample() {
    setAdding(true)
    try {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const det = dbCreateDetection({
        ai_confidence: 0.94,
        extracted_title: "강남역 저녁 약속",
        extracted_date: nextWeek.toISOString().split("T")[0],
        extracted_time: "19:00:00",
        extracted_location: "강남역 2번 출구",
        extracted_participants: ["김민준", "이서연", "박지훈"],
        extracted_purpose: "내일 저녁 강남에서 보자 다들 가능해?",
      })
      setDetections(prev => [det, ...prev])
    } catch {}
    setAdding(false)
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <View>
          <Text style={s.heading}>알림</Text>
          {detections.length > 0 && (
            <Text style={s.subheading}>감지된 약속 {detections.length}건</Text>
          )}
        </View>
        <TouchableOpacity
          style={s.testBtn}
          onPress={addSample}
          disabled={adding}
          activeOpacity={0.8}
        >
          {adding ? <Spinner /> : <Plus size={14} weight="bold" color={C.yellowDark} />}
          <Text style={s.testBtnText}>테스트 감지</Text>
        </TouchableOpacity>
      </View>

      {detections.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <BellRinging size={36} weight="fill" color={C.yellow} />
          </View>
          <Text style={s.emptyTitle}>감지된 약속이 없어요</Text>
          <Text style={s.emptyDesc}>
            카카오톡 대화에서 약속이 감지되면{"\n"}여기에 표시됩니다
          </Text>
          <TouchableOpacity style={s.sampleBtn} onPress={addSample} disabled={adding}>
            <ChatCircleDots size={16} weight="fill" color={C.yellow} />
            <Text style={s.sampleBtnText}>샘플 감지 이벤트 추가해보기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          {detections.map(det => (
            <EventDetectionCard
              key={det.id}
              room={det.extracted_title ?? "카카오톡 채팅방"}
              participants={(det.extracted_participants as string[] | null)?.length ?? 2}
              datetime={fmtDatetime(det)}
              preview={det.extracted_purpose ?? "약속이 감지됐어요"}
              onPress={() => router.push(`/alert/${det.id}` as any)}
            />
          ))}
          <Text style={s.listFooter}>모두 확인 완료하면 사라집니다</Text>
        </ScrollView>
      )}

      <BottomNav pendingCount={detections.length} />
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
  heading: { fontSize: 18, fontWeight: "900", color: C.black },
  subheading: { fontSize: 12, color: C.darkGray, marginTop: 2 },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.yellowLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  testBtnText: { fontSize: 12, fontWeight: "600", color: C.yellowDark },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.black },
  emptyDesc: { fontSize: 13, color: C.darkGray, textAlign: "center", lineHeight: 20 },
  sampleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.yellow,
    borderStyle: "dashed",
    marginTop: 8,
  },
  sampleBtnText: { fontSize: 13, fontWeight: "600", color: C.yellow },
  list: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    gap: 10,
    paddingBottom: 100,
  },
  listFooter: { fontSize: 11, color: C.midGray, textAlign: "center", marginTop: 4 },
})

import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import {
  ArrowLeft, Sparkle, CalendarBlank, Clock, MapPin, Users,
  NotePencil, BellRinging, Trash,
} from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { SmartAlertBadge } from "@/components/shared"
import { C } from "@/lib/theme"
import { MOCK_EVENTS } from "@/lib/mock-data"
import { dbGetEvent, dbCreateEvent, dbUpdateEvent, dbDeleteEvent } from "@/lib/db"
import { scheduleEventNotification } from "@/lib/notifications"
import type { CalendarEvent, EventImportance } from "@/lib/types"

const ALERT_OPTIONS = [15, 30, 45, 60]
const IMPORTANCE_LEVELS: { label: string; value: EventImportance }[] = [
  { label: "일반",      value: "normal" },
  { label: "중요",      value: "important" },
  { label: "매우 중요", value: "very_important" },
]

function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}
function fmtDate(d: string | null) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
}

export default function EventDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id, edit, date } = useLocalSearchParams<{ id: string; edit?: string; date?: string }>()
  const isNew = id === "new"

  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [editMode, setEditMode] = useState(isNew || edit === "true")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [memo, setMemo] = useState("")
  const [importance, setImportance] = useState<EventImportance>("normal")
  const [alertMins, setAlertMins] = useState(30)
  const [alertEnabled, setAlertEnabled] = useState(true)

  useEffect(() => {
    if (isNew) {
      const eventDate = date ?? new Date().toISOString().split("T")[0]
      setEvent({
        id: "", title: "", event_date: eventDate, event_time: null,
        location: null, participants: null, purpose: null, memo: null,
        is_ai_generated: false, importance: "normal",
        created_at: "", updated_at: "",
      })
      return
    }
    const mock = MOCK_EVENTS.find(e => e.id === id)
    if (mock) {
      setEvent(mock); setTitle(mock.title)
      setLocation(mock.location ?? ""); setMemo(mock.memo ?? "")
      setImportance(mock.importance); return
    }
    try {
      const data = dbGetEvent(id)
      if (!data) { setError("일정을 찾을 수 없습니다"); return }
      setEvent(data); setTitle(data.title)
      setLocation(data.location ?? ""); setMemo(data.memo ?? "")
      setImportance(data.importance)
    } catch { setError("불러오기 실패") }
  }, [id, isNew, date, edit])

  function handleSave() {
    if (!event) return
    setSaving(true); setError("")
    try {
      if (isNew) {
        const created = dbCreateEvent({
          title: title || "새 일정",
          event_date: event.event_date,
          event_time: event.event_time,
          location: location || null,
          memo: memo || null,
          importance,
          is_ai_generated: false,
          participants: null,
          purpose: null,
        })
        scheduleEventNotification(created, alertEnabled ? alertMins : 0).catch(() => {})
        router.replace("/calendar")
      } else {
        dbUpdateEvent(event.id, { title: title || event.title, location: location || null, memo: memo || null, importance })
        setEvent({ ...event, title, location: location || null, memo: memo || null, importance })
        setEditMode(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류")
    } finally { setSaving(false) }
  }

  function handleDelete() {
    if (!event?.id) return
    Alert.alert("일정 삭제", "정말 이 일정을 삭제하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제", style: "destructive", onPress: () => {
          try { dbDeleteEvent(event.id); router.replace("/calendar") }
          catch { setError("삭제 중 오류가 발생했습니다") }
        },
      },
    ])
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* 상단 바 */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} weight="bold" color={C.black} />
        </TouchableOpacity>
        <Text style={s.heading}>{isNew ? "새 일정" : "일정 상세"}</Text>
        {!isNew && (
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Text style={s.editToggleText}>{editMode ? "취소" : "편집"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {event?.is_ai_generated && (
          <View style={s.aiBanner}>
            <Sparkle size={15} weight="fill" color={C.yellow} />
            <Text style={s.aiBannerText}>AI가 자동 생성한 일정</Text>
          </View>
        )}

        {/* 기본 정보 카드 */}
        <View style={s.card}>
          {[
            {
              icon: NotePencil, label: "제목",
              content: editMode
                ? <TextInput value={title} onChangeText={setTitle} placeholder="일정 제목을 입력하세요" style={s.input} placeholderTextColor={C.midGray} />
                : <Text style={s.fieldValue}>{event?.title || "제목 없음"}</Text>,
            },
            {
              icon: CalendarBlank, label: "날짜",
              content: <Text style={s.fieldValue}>{fmtDate(event?.event_date ?? null)}</Text>,
            },
            {
              icon: Clock, label: "시간",
              content: <Text style={s.fieldValue}>{fmtTime(event?.event_time ?? null) || "시간 없음"}</Text>,
            },
            {
              icon: MapPin, label: "장소",
              content: editMode
                ? <TextInput value={location} onChangeText={setLocation} placeholder="장소를 입력하세요" style={s.input} placeholderTextColor={C.midGray} />
                : <Text style={s.fieldValue}>{event?.location || "장소 없음"}</Text>,
            },
          ].map(({ icon: Icon, label, content }, i, arr) => (
            <View key={label} style={[s.fieldRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Icon size={16} weight="fill" color={C.yellow} />
              <Text style={s.fieldLabel}>{label}</Text>
              <View style={s.fieldContent}>{content}</View>
            </View>
          ))}
          <View style={[s.fieldRow, { borderBottomWidth: 0, alignItems: "flex-start" }]}>
            <NotePencil size={16} weight="fill" color={C.yellow} style={{ marginTop: 2 }} />
            <Text style={[s.fieldLabel, { marginTop: 2 }]}>메모</Text>
            <View style={s.fieldContent}>
              {editMode
                ? <TextInput value={memo} onChangeText={setMemo} placeholder="메모를 입력하세요" multiline style={[s.input, { minHeight: 48 }]} placeholderTextColor={C.midGray} />
                : <Text style={s.fieldValue}>{event?.memo || "-"}</Text>}
            </View>
          </View>
        </View>

        {/* 참여자 */}
        {event?.participants && event.participants.length > 0 && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Users size={15} weight="fill" color={C.yellow} />
              <Text style={s.cardHeaderText}>참여자</Text>
            </View>
            <View style={s.chips}>
              {event.participants.map(name => (
                <View key={name} style={s.chip}>
                  <View style={s.chipAvatar}>
                    <Text style={s.chipAvatarText}>{name.slice(0, 1)}</Text>
                  </View>
                  <Text style={s.chipText}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 알림 설정 */}
        <View style={s.card}>
          <View style={s.alertHeader}>
            <View style={s.alertHeaderLeft}>
              <BellRinging size={15} weight="fill" color={C.yellow} />
              <Text style={s.cardHeaderText}>버퍼 알림 설정</Text>
            </View>
            <TouchableOpacity
              style={[s.toggleTrack, { backgroundColor: alertEnabled ? C.yellow : C.lightGray }]}
              onPress={() => setAlertEnabled(!alertEnabled)}
              activeOpacity={0.8}
            >
              <View style={[s.toggleThumb, { transform: [{ translateX: alertEnabled ? 20 : 0 }] }]} />
            </TouchableOpacity>
          </View>

          {alertEnabled && (
            <>
              <Text style={s.subLabel}>알림 시점</Text>
              <View style={s.optionRow}>
                {ALERT_OPTIONS.map(mins => (
                  <TouchableOpacity
                    key={mins}
                    style={[s.optionBtn, alertMins === mins && s.optionBtnActive]}
                    onPress={() => setAlertMins(mins)}
                  >
                    <Text style={[s.optionBtnText, alertMins === mins && s.optionBtnTextActive]}>
                      {mins < 60 ? `${mins}분 전` : "1시간 전"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.subLabel}>중요도</Text>
              <View style={s.optionRow}>
                {IMPORTANCE_LEVELS.map(({ label, value }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      s.optionBtn,
                      importance === value && s.optionBtnActive,
                    ]}
                    onPress={() => setImportance(value)}
                  >
                    <Text style={[s.optionBtnText, importance === value && s.optionBtnTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SmartAlertBadge label={alertMins < 60 ? `${alertMins}분 전 알림` : "1시간 전 알림"} important />
            </>
          )}
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        {(editMode || isNew) && (
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>저장하기</Text>
          </TouchableOpacity>
        )}
        {!isNew && (
          <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
            <Trash size={14} weight="fill" color="#F87171" />
            <Text style={s.deleteBtnText}>일정 삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { flex: 1, fontSize: 16, fontWeight: "700", color: C.black },
  editToggleText: { fontSize: 13, color: C.yellow, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.yellowLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  aiBannerText: { fontSize: 12, fontWeight: "600", color: C.yellowDark },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.lightGray,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    padding: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    paddingBottom: 8,
  },
  cardHeaderText: { fontSize: 13, fontWeight: "600", color: C.black },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.ultraLight,
  },
  fieldLabel: { fontSize: 12, color: C.darkGray, width: 32 },
  fieldContent: { flex: 1 },
  fieldValue: { fontSize: 13, fontWeight: "500", color: C.black },
  input: {
    fontSize: 13,
    fontWeight: "500",
    color: C.black,
    padding: 0,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12, paddingTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.yellowLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  chipAvatarText: { fontSize: 9, fontWeight: "700", color: "#1A1A1A" },
  chipText: { fontSize: 12, fontWeight: "500", color: C.yellowDark },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingBottom: 8,
  },
  alertHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  subLabel: { fontSize: 11, color: C.darkGray, paddingHorizontal: 12, marginBottom: 6 },
  optionRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, marginBottom: 12 },
  optionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.lightGray,
    alignItems: "center",
    backgroundColor: C.white,
  },
  optionBtnActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  optionBtnText: { fontSize: 11, fontWeight: "600", color: C.darkGray },
  optionBtnTextActive: { color: "#1A1A1A" },
  errorText: { fontSize: 12, color: "#EF4444", fontWeight: "500", paddingHorizontal: 4 },
  footer: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.lightGray,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  saveBtn: {
    backgroundColor: C.yellow,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 13, color: "#F87171", fontWeight: "500" },
})

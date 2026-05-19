import { useEffect, useState, useCallback } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native"
import { useRouter } from "expo-router"
import { CaretLeft, CaretRight, Plus, Clock, MapPin } from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BottomNav, Spinner } from "@/components/shared"
import { C } from "@/lib/theme"
import { MOCK_EVENTS } from "@/lib/mock-data"
import { dbGetEvents } from "@/lib/db"
import type { CalendarEvent } from "@/lib/types"

const DOW = ["일", "월", "화", "수", "목", "금", "토"]

function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}

export default function CalendarScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const today = new Date()
  const todayISO = today.toISOString().split("T")[0]

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayISO)
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [loading, setLoading] = useState(false)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length < 42) cells.push(null)

  const fetchEvents = useCallback(() => {
    setLoading(true)
    try {
      const data = dbGetEvents(year, month + 1)
      if (data.length) setEvents(data)
    } catch {}
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  function dotType(day: number): "ai" | "manual" | "both" | null {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayEvents = events.filter(e => e.event_date === iso)
    if (!dayEvents.length) return null
    const hasAI = dayEvents.some(e => e.is_ai_generated)
    const hasManual = dayEvents.some(e => !e.is_ai_generated)
    if (hasAI && hasManual) return "both"
    return hasAI ? "ai" : "manual"
  }

  const selectedEvents = events.filter(e => e.event_date === selectedDate)

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Text style={s.heading}>캘린더</Text>
        <View style={s.viewToggle}>
          {["월간", "주간"].map(v => (
            <View key={v} style={[s.toggleBtn, v === "월간" && s.toggleBtnActive]}>
              <Text style={[s.toggleBtnText, v === "월간" && s.toggleBtnTextActive]}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* 월 이동 */}
        <View style={s.monthNav}>
          <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
            <CaretLeft size={14} weight="bold" color={C.darkGray} />
          </TouchableOpacity>
          <View style={s.monthCenter}>
            <Text style={s.monthText}>{year}년 {month + 1}월</Text>
            <Text style={s.todayText}>오늘: {today.getDate()}일</Text>
          </View>
          <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
            <CaretRight size={14} weight="bold" color={C.darkGray} />
          </TouchableOpacity>
        </View>

        {/* 캘린더 그리드 */}
        <View style={s.calendarCard}>
          <View style={s.dowRow}>
            {DOW.map((d, i) => (
              <Text key={d} style={[s.dowText, i === 0 ? s.red : i === 6 ? s.blue : {}]}>{d}</Text>
            ))}
          </View>
          {loading ? <Spinner /> : (
            <View style={s.grid}>
              {cells.map((day, idx) => {
                const colIdx = idx % 7
                const iso = day
                  ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : ""
                const isToday = iso === todayISO
                const isSelected = iso === selectedDate
                const dot = day ? dotType(day) : null
                return (
                  <View key={idx} style={s.dayCell}>
                    {day ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setSelectedDate(iso)}
                          style={[
                            s.dayBtn,
                            isToday && s.dayBtnToday,
                            isSelected && !isToday && s.dayBtnSelected,
                          ]}
                        >
                          <Text style={[
                            s.dayText,
                            isToday && s.dayTextToday,
                            colIdx === 0 && !isToday && s.red,
                            colIdx === 6 && !isToday && s.blue,
                          ]}>{day}</Text>
                        </TouchableOpacity>
                        <View style={s.dotRow}>
                          {(dot === "ai" || dot === "both") && <View style={[s.dot, { backgroundColor: C.yellow }]} />}
                          {(dot === "manual" || dot === "both") && <View style={[s.dot, { backgroundColor: C.midGray }]} />}
                        </View>
                      </>
                    ) : <View style={s.dayBtn} />}
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* 범례 */}
        <View style={s.legend}>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: C.yellow }]} />
            <Text style={s.legendText}>AI 자동 생성</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: C.midGray }]} />
            <Text style={s.legendText}>수동 입력</Text>
          </View>
        </View>

        {/* 선택일 일정 */}
        <View style={s.eventsSection}>
          <View style={s.eventsHeader}>
            <View style={s.eventsHeaderDot} />
            <Text style={s.eventsHeaderText}>
              {new Date(selectedDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} 일정
            </Text>
            <Text style={s.eventsCount}>{selectedEvents.length}개</Text>
          </View>

          {selectedEvents.length === 0 ? (
            <Text style={s.emptyText}>이 날의 일정이 없어요</Text>
          ) : (
            selectedEvents.map(event => (
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
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + 82 }]}
        onPress={() => router.push(`/events/new?date=${selectedDate}` as any)}
        activeOpacity={0.85}
      >
        <Plus size={24} weight="bold" color="#1A1A1A" />
      </TouchableOpacity>

      <BottomNav />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  heading: { fontSize: 18, fontWeight: "900", color: C.black },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.lightGray,
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnActive: { backgroundColor: C.yellow },
  toggleBtnText: { fontSize: 12, fontWeight: "600", color: C.darkGray },
  toggleBtnTextActive: { color: "#1A1A1A" },
  scroll: { flex: 1 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  monthCenter: { alignItems: "center" },
  monthText: { fontSize: 16, fontWeight: "900", color: C.black },
  todayText: { fontSize: 11, color: C.darkGray, marginTop: 2 },
  calendarCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.lightGray,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dowRow: { flexDirection: "row", marginBottom: 8 },
  dowText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: C.darkGray,
    paddingVertical: 4,
  },
  red: { color: "#F87171" },
  blue: { color: "#60A5FA" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.285%",
    alignItems: "center",
    paddingVertical: 2,
  },
  dayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBtnToday: { backgroundColor: C.yellow },
  dayBtnSelected: { backgroundColor: C.yellowLight },
  dayText: { fontSize: 13, fontWeight: "600", color: C.black },
  dayTextToday: { color: "#1A1A1A" },
  dotRow: { flexDirection: "row", gap: 2, height: 6, alignItems: "center", marginTop: 1 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: C.darkGray },
  eventsSection: { paddingHorizontal: 16, gap: 10 },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventsHeaderDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.yellow },
  eventsHeaderText: { flex: 1, fontSize: 13, fontWeight: "700", color: C.black },
  eventsCount: { fontSize: 12, color: C.yellow, fontWeight: "600" },
  emptyText: { fontSize: 13, color: C.midGray, textAlign: "center", paddingVertical: 16 },
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
  fab: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
})

import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from "react-native"
import {
  Bell, Sliders, ChatCircle, Translate, Trash, Info,
  CaretRight, CheckCircle, GoogleLogo, Database,
} from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Avatar, BottomNav, Toggle } from "@/components/shared"
import { C } from "@/lib/theme"
import { dbGetSettings, dbUpdateSettings } from "@/lib/db"
import type { AISensitivity } from "@/lib/types"

const SENSITIVITY_LABELS: Record<AISensitivity, string> = { low: "낮음", medium: "보통", high: "높음" }
const SENSITIVITY_VALUES: AISensitivity[] = ["low", "medium", "high"]

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>
}

function SettingRow({ icon: Icon, label, value, hasArrow = true, toggle, onToggle, danger = false, onPress }: {
  icon: any; label: string; value?: string; hasArrow?: boolean
  toggle?: boolean; onToggle?: () => void; danger?: boolean; onPress?: () => void
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <Icon size={16} weight="fill" color={danger ? "#F87171" : C.yellow} />
      </View>
      <Text style={[s.rowLabel, danger && s.rowLabelDanger]}>{label}</Text>
      {value && <Text style={s.rowValue}>{value}</Text>}
      {toggle !== undefined && onToggle && <Toggle on={toggle} onToggle={onToggle} />}
      {hasArrow && toggle === undefined && <CaretRight size={14} color={C.midGray} />}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const [userName, setUserName] = useState("사용자")
  const [googleLinked, setGoogleLinked] = useState(false)
  const [sensitivity, setSensitivity] = useState<AISensitivity>("high")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const s = dbGetSettings()
      setUserName(s.userName)
      setGoogleLinked(s.googleCalendarConnected)
      setSensitivity(s.aiSensitivity)
    } catch {}
  }, [])

  function patch(data: Parameters<typeof dbUpdateSettings>[0]) {
    setSaving(true)
    try { dbUpdateSettings(data) } catch {}
    setSaving(false)
  }

  function toggleGoogle() {
    const next = !googleLinked
    setGoogleLinked(next)
    patch({ googleCalendarConnected: next })
  }

  function changeSensitivity(val: AISensitivity) {
    setSensitivity(val)
    patch({ aiSensitivity: val })
  }

  const sensitivityPct = { low: 25, medium: 50, high: 75 }[sensitivity]

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Text style={s.heading}>설정</Text>
        {saving && <View style={s.savingDot} />}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={s.profileCard}>
          <Avatar initials={userName.slice(0, 2)} size="lg" />
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{userName}</Text>
            <Text style={s.profileMode}>로컬 모드</Text>
            <View style={s.profileStatus}>
              <View style={s.statusDot} />
              <Text style={s.statusText}>SQLite 연결됨</Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn}>
            <Text style={s.editBtnText}>편집</Text>
          </TouchableOpacity>
        </View>

        {/* 연동 상태 */}
        <View>
          <SectionHeader title="연동 상태" />
          <View style={s.card}>
            <View style={[s.row, { borderBottomWidth: 1, borderBottomColor: C.ultraLight }]}>
              <View style={[s.rowIcon, { backgroundColor: C.yellowLight }]}>
                <ChatCircle size={16} weight="fill" color={C.yellow} />
              </View>
              <Text style={[s.rowLabel, { flex: 1 }]}>카카오톡</Text>
              <TouchableOpacity style={s.connectBtn}>
                <Text style={s.connectBtnText}>연결</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.row, { borderBottomWidth: 1, borderBottomColor: C.ultraLight }]}>
              <View style={[s.rowIcon, { backgroundColor: C.blueLight }]}>
                <GoogleLogo size={16} weight="fill" color={C.blue} />
              </View>
              <Text style={[s.rowLabel, { flex: 1 }]}>Google 캘린더</Text>
              <Toggle on={googleLinked} onToggle={toggleGoogle} />
            </View>
            <View style={s.row}>
              <View style={[s.rowIcon, { backgroundColor: C.greenLight }]}>
                <Database size={16} weight="fill" color={C.greenDark} />
              </View>
              <Text style={[s.rowLabel, { flex: 1 }]}>로컬 DB (SQLite)</Text>
              <CheckCircle size={18} weight="fill" color={C.green} />
            </View>
          </View>
        </View>

        {/* AI 설정 */}
        <View>
          <SectionHeader title="AI 설정" />
          <View style={s.card}>
            <SettingRow icon={Bell} label="알림 설정" />
            <View style={[s.sensitivityWrap, { borderBottomWidth: 1, borderBottomColor: C.ultraLight }]}>
              <View style={s.sensitivityHeader}>
                <View style={[s.rowIcon, { backgroundColor: C.yellowLight }]}>
                  <Sliders size={16} weight="fill" color={C.yellow} />
                </View>
                <Text style={[s.rowLabel, { flex: 1 }]}>AI 감지 민감도</Text>
                <Text style={s.sensitivityValue}>{SENSITIVITY_LABELS[sensitivity]}</Text>
              </View>
              <View style={s.sensitivityBtns}>
                {SENSITIVITY_VALUES.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[s.sensitivityBtn, sensitivity === val && s.sensitivityBtnActive]}
                    onPress={() => changeSensitivity(val)}
                  >
                    <Text style={[s.sensitivityBtnText, sensitivity === val && s.sensitivityBtnTextActive]}>
                      {SENSITIVITY_LABELS[val]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.sliderWrap}>
                <Text style={s.sliderLabel}>낮음</Text>
                <View style={s.sliderTrack}>
                  <View style={[s.sliderFill, { width: `${sensitivityPct}%` }]} />
                  <View style={[s.sliderThumb, { left: `${sensitivityPct}%` as any }]} />
                </View>
                <Text style={s.sliderLabel}>높음</Text>
              </View>
            </View>
            <SettingRow icon={ChatCircle} label="모니터링 채팅방" value="설정하기" />
          </View>
        </View>

        {/* 일반 */}
        <View>
          <SectionHeader title="일반" />
          <View style={s.card}>
            <SettingRow icon={Translate} label="언어 설정" value="한국어" />
            <SettingRow icon={Info} label="앱 정보" value="v1.0.0" />
          </View>
        </View>

        {/* 데이터 */}
        <View>
          <SectionHeader title="데이터" />
          <View style={s.card}>
            <SettingRow
              icon={Trash}
              label="데이터 초기화"
              danger
              hasArrow={false}
              onPress={() => Alert.alert("데이터 초기화", "모든 데이터를 초기화하시겠어요?", [
                { text: "취소", style: "cancel" },
                { text: "초기화", style: "destructive", onPress: () => {} },
              ])}
            />
          </View>
        </View>

        <Text style={s.footer}>로컬 SQLite 모드 · 인증 없음</Text>
        <View style={{ height: 16 }} />
      </ScrollView>

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
  savingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.lightGray,
    borderTopColor: C.yellow,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 20 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: C.darkGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  profileCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.lightGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 15, fontWeight: "700", color: C.black },
  profileMode: { fontSize: 12, color: C.darkGray },
  profileStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  statusText: { fontSize: 11, color: C.greenDark, fontWeight: "500" },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.lightGray,
  },
  editBtnText: { fontSize: 12, color: C.darkGray, fontWeight: "500" },
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: { backgroundColor: "#FEF2F2" },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: "500", color: C.black },
  rowLabelDanger: { color: "#F87171" },
  rowValue: { fontSize: 12, color: C.darkGray },
  connectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.yellow,
  },
  connectBtnText: { fontSize: 12, fontWeight: "600", color: C.yellow },
  sensitivityWrap: { paddingHorizontal: 14, paddingVertical: 12 },
  sensitivityHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sensitivityValue: { fontSize: 12, fontWeight: "700", color: C.yellow },
  sensitivityBtns: { flexDirection: "row", gap: 8, marginBottom: 12 },
  sensitivityBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.lightGray,
    alignItems: "center",
    backgroundColor: C.white,
  },
  sensitivityBtnActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  sensitivityBtnText: { fontSize: 11, fontWeight: "600", color: C.darkGray },
  sensitivityBtnTextActive: { color: "#1A1A1A" },
  sliderWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  sliderLabel: { fontSize: 10, color: C.midGray },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: C.ultraLight,
    borderRadius: 4,
    position: "relative",
    overflow: "visible",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 8,
    backgroundColor: C.yellow,
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.yellow,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: -8,
  },
  footer: { fontSize: 11, color: C.midGray, textAlign: "center" },
})

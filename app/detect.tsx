import { useState, useEffect } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import {
  ArrowLeft, Sparkle, CalendarBlank, Clock, MapPin,
  Users, Tag, PaperPlaneRight, Key, CheckCircle,
} from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { C } from "@/lib/theme"
import { detectEventFromText, type ExtractedEvent } from "@/lib/claude"
import { getApiKey, saveApiKey } from "@/lib/store"
import { dbCreateDetection } from "@/lib/db"
import { scheduleDetectionNotification } from "@/lib/notifications"

function fmtDate(d: string | null) {
  if (!d) return "날짜 미정"
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })
}
function fmtTime(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  return `${hour >= 12 ? "오후" : "오전"} ${hour > 12 ? hour - 12 : hour}:${m}`
}

const SAMPLE_CHAT = `민준: 야 이번 주 금요일 저녁에 강남역 근처에서 보는거 어때?
서연: 오 좋아! 7시 괜찮아?
지훈: 나도 가능해~ 강남역 2번 출구 근처로 하자
민준: ㅇㅋ 그럼 금요일 오후 7시 강남역 2번 출구 앞에서!`

export default function DetectScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [chatText, setChatText] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExtractedEvent | null>(null)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getApiKey().then(k => {
      setSavedKey(k)
      if (!k) setShowKeyInput(true)
    })
  }, [])

  async function handleSaveKey() {
    if (!apiKey.trim()) return
    await saveApiKey(apiKey.trim())
    setSavedKey(apiKey.trim())
    setShowKeyInput(false)
    setApiKey("")
  }

  async function handleAnalyze() {
    const key = savedKey
    if (!key) { setShowKeyInput(true); return }
    if (!chatText.trim()) { setError("분석할 대화를 입력해주세요"); return }

    setLoading(true); setError(""); setResult(null); setSaved(false)
    try {
      const extracted = await detectEventFromText(chatText, key)
      setResult(extracted)
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    const det = dbCreateDetection({
      ai_confidence: result.confidence,
      extracted_title: result.title,
      extracted_date: result.date,
      extracted_time: result.time,
      extracted_location: result.location,
      extracted_participants: result.participants,
      extracted_purpose: result.purpose,
    })
    await scheduleDetectionNotification(result.title ?? "새 약속이 감지됐어요").catch(() => {})
    setSaved(true)
    setTimeout(() => router.replace(`/alert/${det.id}` as any), 800)
  }

  const confPct = result ? Math.round(result.confidence * 100) : 0

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} weight="bold" color={C.black} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Sparkle size={18} weight="fill" color={C.yellow} />
          <Text style={s.headerTitle}>AI 약속 분석</Text>
        </View>
        <TouchableOpacity
          style={[s.keyBtn, savedKey && s.keyBtnActive]}
          onPress={() => setShowKeyInput(!showKeyInput)}
        >
          <Key size={14} weight="fill" color={savedKey ? C.greenDark : C.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* API 키 입력 */}
        {showKeyInput && (
          <View style={s.keyCard}>
            <View style={s.keyCardHeader}>
              <Key size={16} weight="fill" color={C.yellow} />
              <Text style={s.keyCardTitle}>Anthropic API 키</Text>
            </View>
            <Text style={s.keyCardDesc}>
              Claude AI를 사용하려면 Anthropic API 키가 필요해요.{"\n"}
              키는 기기에 안전하게 저장됩니다.
            </Text>
            <View style={s.keyInputRow}>
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-ant-..."
                placeholderTextColor={C.midGray}
                style={s.keyInput}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[s.keySubmitBtn, !apiKey.trim() && s.keySubmitBtnDisabled]}
                onPress={handleSaveKey}
                disabled={!apiKey.trim()}
              >
                <Text style={s.keySubmitBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
            {savedKey && (
              <TouchableOpacity onPress={() => setShowKeyInput(false)}>
                <Text style={s.cancelKeyText}>취소</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 입력 안내 */}
        <View style={s.inputSection}>
          <View style={s.inputLabelRow}>
            <Text style={s.inputLabel}>카카오톡 대화 붙여넣기</Text>
            <TouchableOpacity onPress={() => setChatText(SAMPLE_CHAT)}>
              <Text style={s.sampleBtn}>샘플 넣기</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={chatText}
            onChangeText={text => { setChatText(text); setResult(null); setSaved(false) }}
            placeholder={"카카오톡 대화를 복사해서 붙여넣으세요\n\n예: 야 금요일 저녁 강남역에서 보자\n      오케이 7시 어때?"}
            placeholderTextColor={C.midGray}
            style={s.chatInput}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 분석 버튼 */}
        <TouchableOpacity
          style={[s.analyzeBtn, (loading || !chatText.trim()) && s.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={loading || !chatText.trim()}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#1A1A1A" size="small" />
          ) : (
            <Sparkle size={18} weight="fill" color="#1A1A1A" />
          )}
          <Text style={s.analyzeBtnText}>
            {loading ? "AI 분석 중..." : "AI로 약속 분석하기"}
          </Text>
        </TouchableOpacity>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 분석 결과 */}
        {result && (
          <View style={s.resultCard}>
            <View style={s.resultHeader}>
              <View style={s.resultIconWrap}>
                <Sparkle size={18} weight="fill" color={C.yellow} />
              </View>
              <View style={s.resultHeaderText}>
                <Text style={s.resultTitle}>분석 완료!</Text>
                <Text style={s.resultSub}>{result.title ?? "새 약속"}</Text>
              </View>
              <View style={[s.confBadge, confPct >= 80 && s.confBadgeHigh, confPct < 60 && s.confBadgeLow]}>
                <Text style={s.confBadgeText}>신뢰도 {confPct}%</Text>
              </View>
            </View>

            <View style={s.resultRows}>
              {[
                { icon: CalendarBlank, label: "날짜",   value: fmtDate(result.date) },
                { icon: Clock,         label: "시간",   value: fmtTime(result.time) || "시간 미정" },
                { icon: MapPin,        label: "장소",   value: result.location || "장소 미정" },
                { icon: Users,         label: "참여자", value: result.participants?.join(", ") || "미정" },
                { icon: Tag,           label: "내용",   value: result.purpose || "미정" },
              ].map(({ icon: Icon, label, value }, i, arr) => (
                <View key={label} style={[s.resultRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={s.resultRowIcon}>
                    <Icon size={13} weight="fill" color={C.yellow} />
                  </View>
                  <Text style={s.resultRowLabel}>{label}</Text>
                  <Text style={s.resultRowValue} numberOfLines={2}>{value}</Text>
                </View>
              ))}
            </View>

            {saved ? (
              <View style={s.savedBanner}>
                <CheckCircle size={18} weight="fill" color={C.greenDark} />
                <Text style={s.savedBannerText}>저장됐어요! 알림 목록으로 이동 중...</Text>
              </View>
            ) : (
              <View style={s.resultActions}>
                <TouchableOpacity
                  style={s.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <PaperPlaneRight size={16} weight="fill" color="#1A1A1A" />
                  <Text style={s.saveBtnText}>저장하고 확인하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.reanalyzeBtn}
                  onPress={() => setResult(null)}
                >
                  <Text style={s.reanalyzeBtnText}>다시 분석</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
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
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: C.black },
  keyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.ultraLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.lightGray,
  },
  keyBtnActive: { backgroundColor: C.greenLight, borderColor: C.green },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  keyCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.lightGray,
    gap: 10,
  },
  keyCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  keyCardTitle: { fontSize: 14, fontWeight: "700", color: C.black },
  keyCardDesc: { fontSize: 12, color: C.darkGray, lineHeight: 18 },
  keyInputRow: { flexDirection: "row", gap: 8 },
  keyInput: {
    flex: 1,
    backgroundColor: C.ultraLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: C.black,
    borderWidth: 1,
    borderColor: C.lightGray,
  },
  keySubmitBtn: {
    backgroundColor: C.yellow,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  keySubmitBtnDisabled: { opacity: 0.4 },
  keySubmitBtnText: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  cancelKeyText: { fontSize: 12, color: C.midGray, textAlign: "center" },
  inputSection: { gap: 8 },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: { fontSize: 13, fontWeight: "700", color: C.black },
  sampleBtn: { fontSize: 12, color: C.yellow, fontWeight: "600" },
  chatInput: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.lightGray,
    padding: 14,
    fontSize: 13,
    color: C.black,
    minHeight: 160,
    lineHeight: 20,
  },
  analyzeBtn: {
    backgroundColor: C.yellow,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  analyzeBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  analyzeBtnText: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: { fontSize: 13, color: "#DC2626", lineHeight: 18 },
  resultCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.lightGray,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.ultraLight,
  },
  resultIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  resultHeaderText: { flex: 1 },
  resultTitle: { fontSize: 14, fontWeight: "700", color: C.black },
  resultSub: { fontSize: 12, color: C.darkGray, marginTop: 2 },
  confBadge: {
    backgroundColor: C.yellowLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confBadgeHigh: { backgroundColor: C.greenLight },
  confBadgeLow: { backgroundColor: "#FEF2F2" },
  confBadgeText: { fontSize: 11, fontWeight: "700", color: C.yellowDark },
  resultRows: { paddingHorizontal: 16 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.ultraLight,
  },
  resultRowIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  resultRowLabel: { width: 40, fontSize: 11, color: C.darkGray },
  resultRowValue: { flex: 1, fontSize: 13, fontWeight: "500", color: C.black },
  resultActions: { padding: 16, gap: 10 },
  saveBtn: {
    backgroundColor: C.yellow,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  reanalyzeBtn: { alignItems: "center", paddingVertical: 4 },
  reanalyzeBtnText: { fontSize: 13, color: C.midGray },
  savedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: C.greenLight,
  },
  savedBannerText: { fontSize: 13, fontWeight: "600", color: C.greenDark },
})

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { CalendarBlank, ChatCircle } from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { C } from "@/lib/theme"

export default function LoginScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}>
      <View style={s.logoWrap}>
        <View style={s.logoBox}>
          <CalendarBlank size={28} weight="fill" color="#1A1A1A" />
          <View style={s.logoBadge}>
            <ChatCircle size={11} weight="fill" color={C.yellow} />
          </View>
        </View>
        <Text style={s.title}>TCM</Text>
        <Text style={s.subtitle}>Talk-to-Calendar Manager</Text>
      </View>

      <View style={s.body}>
        <Text style={s.desc}>
          카카오톡 대화에서 약속을 자동으로 감지하고{"\n"}캘린더에 저장해드려요
        </Text>
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={s.btn}
          onPress={() => router.replace("/home")}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>시작하기</Text>
        </TouchableOpacity>
        <Text style={s.hint}>로컬 모드 · 인증 없음</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  logoWrap: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 32,
    gap: 8,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: C.black,
    letterSpacing: -0.5,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: C.darkGray,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  desc: {
    fontSize: 14,
    color: C.darkGray,
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  btn: {
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
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  hint: {
    fontSize: 11,
    color: C.midGray,
    textAlign: "center",
  },
})

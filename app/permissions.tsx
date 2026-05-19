import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from "react-native"
import { useRouter } from "expo-router"
import {
  Bell, ShieldCheck, CheckCircle, Warning, ArrowRight, X,
} from "phosphor-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { C } from "@/lib/theme"
import {
  getPermissionStatus, openNotificationSettings, openAccessibilitySettings,
} from "@/lib/kakao-service"

interface PermStatus {
  notification: boolean
  accessibility: boolean
}

export default function PermissionsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [perms, setPerms] = useState<PermStatus>({ notification: false, accessibility: false })
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const status = await getPermissionStatus()
    setPerms(status)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const allGranted = perms.notification && perms.accessibility

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>권한 설정</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={20} color={C.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.desc}>
          <ShieldCheck size={32} weight="fill" color={C.yellow} />
          <Text style={s.descTitle}>카카오톡 메시지 감지를 위한 권한</Text>
          <Text style={s.descText}>
            아래 두 가지 권한을 허용해야 카카오톡 약속을{"\n"}자동으로 감지하고 캘린더에 저장할 수 있어요
          </Text>
        </View>

        {/* 알림 접근 권한 */}
        <View style={[s.permCard, perms.notification && s.permCardGranted]}>
          <View style={s.permCardLeft}>
            <View style={[s.permIcon, perms.notification && s.permIconGranted]}>
              <Bell size={20} weight="fill" color={perms.notification ? C.greenDark : C.yellow} />
            </View>
            <View style={s.permInfo}>
              <Text style={s.permName}>알림 접근 권한</Text>
              <Text style={s.permDesc}>
                {perms.notification
                  ? "허용됨 — 카카오톡 알림을 읽을 수 있어요"
                  : "카카오톡 알림에서 메시지를 읽어옵니다"}
              </Text>
            </View>
          </View>
          {perms.notification ? (
            <CheckCircle size={22} weight="fill" color={C.green} />
          ) : (
            <TouchableOpacity
              style={s.grantBtn}
              onPress={openNotificationSettings}
              activeOpacity={0.85}
            >
              <Text style={s.grantBtnText}>설정</Text>
              <ArrowRight size={13} weight="bold" color="#1A1A1A" />
            </TouchableOpacity>
          )}
        </View>

        {/* 접근성 권한 */}
        <View style={[s.permCard, perms.accessibility && s.permCardGranted]}>
          <View style={s.permCardLeft}>
            <View style={[s.permIcon, perms.accessibility && s.permIconGranted]}>
              <ShieldCheck size={20} weight="fill" color={perms.accessibility ? C.greenDark : C.yellow} />
            </View>
            <View style={s.permInfo}>
              <Text style={s.permName}>접근성 서비스</Text>
              <Text style={s.permDesc}>
                {perms.accessibility
                  ? "허용됨 — 채팅창 메시지를 읽을 수 있어요"
                  : "채팅창이 열려있을 때 메시지를 읽어옵니다"}
              </Text>
            </View>
          </View>
          {perms.accessibility ? (
            <CheckCircle size={22} weight="fill" color={C.green} />
          ) : (
            <TouchableOpacity
              style={s.grantBtn}
              onPress={openAccessibilitySettings}
              activeOpacity={0.85}
            >
              <Text style={s.grantBtnText}>설정</Text>
              <ArrowRight size={13} weight="bold" color="#1A1A1A" />
            </TouchableOpacity>
          )}
        </View>

        {!perms.notification || !perms.accessibility ? (
          <View style={s.warningBox}>
            <Warning size={16} weight="fill" color="#D97706" />
            <Text style={s.warningText}>
              설정 앱에서 권한을 허용한 뒤 아래 새로고침 버튼을 눌러주세요
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={s.refreshBtn} onPress={refresh} activeOpacity={0.85}>
          <Text style={s.refreshBtnText}>권한 상태 새로고침</Text>
        </TouchableOpacity>

        {allGranted && (
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <CheckCircle size={18} weight="fill" color="#1A1A1A" />
            <Text style={s.doneBtnText}>완료 — 자동 감지 활성화됨</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    paddingVertical: 14,
  },
  title: { fontSize: 17, fontWeight: "800", color: C.black },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  desc: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  descTitle: { fontSize: 16, fontWeight: "700", color: C.black, textAlign: "center" },
  descText: { fontSize: 13, color: C.darkGray, textAlign: "center", lineHeight: 20 },
  permCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: C.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  permCardGranted: { borderColor: C.green, backgroundColor: "#F0FDF4" },
  permCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  permIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.yellowLight,
    alignItems: "center",
    justifyContent: "center",
  },
  permIconGranted: { backgroundColor: C.greenLight },
  permInfo: { flex: 1 },
  permName: { fontSize: 14, fontWeight: "700", color: C.black },
  permDesc: { fontSize: 12, color: C.darkGray, marginTop: 2, lineHeight: 16 },
  grantBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.yellow,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  grantBtnText: { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 18 },
  refreshBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.lightGray,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: C.white,
  },
  refreshBtnText: { fontSize: 14, fontWeight: "600", color: C.darkGray },
  doneBtn: {
    backgroundColor: C.yellow,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
})

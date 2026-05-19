import React from "react"
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native"
import { useRouter, usePathname } from "expo-router"
import {
  House, CalendarBlank, BellRinging, Gear,
} from "phosphor-react-native"
import { C } from "@/lib/theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"

// ── Avatar ────────────────────────────────────────────────────

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 24 : size === "lg" ? 48 : 32
  const fs = size === "sm" ? 9 : size === "lg" ? 16 : 12
  return (
    <View style={[s.avatar, { width: dim, height: dim, borderRadius: dim / 2 }]}>
      <Text style={[s.avatarText, { fontSize: fs }]}>{initials}</Text>
    </View>
  )
}

// ── Toggle ────────────────────────────────────────────────────

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[s.toggleTrack, { backgroundColor: on ? C.yellow : C.lightGray }]}
      activeOpacity={0.8}
    >
      <View style={[s.toggleThumb, { transform: [{ translateX: on ? 20 : 0 }] }]} />
    </TouchableOpacity>
  )
}

// ── Spinner ───────────────────────────────────────────────────

export function Spinner() {
  return (
    <View style={s.spinnerWrap}>
      <ActivityIndicator color={C.yellow} size="small" />
    </View>
  )
}

// ── SmartAlertBadge ───────────────────────────────────────────

export function SmartAlertBadge({ label, important }: { label: string; important?: boolean }) {
  return (
    <View style={[s.badge, important && s.badgeImportant]}>
      <Text style={[s.badgeText, important && s.badgeTextImportant]}>{label}</Text>
    </View>
  )
}

// ── BottomNav ─────────────────────────────────────────────────

const LEFT_ITEMS = [
  { href: "/home",     Icon: House,        label: "홈" },
  { href: "/calendar", Icon: CalendarBlank, label: "캘린더" },
] as const

const RIGHT_ITEMS = [
  { href: "/alerts",   Icon: BellRinging,  label: "알림" },
  { href: "/settings", Icon: Gear,         label: "설정" },
] as const

export function BottomNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  function NavItem({ href, Icon, label }: { href: string; Icon: any; label: string }) {
    const active = pathname === href || pathname.startsWith(href + "/")
    return (
      <TouchableOpacity
        style={s.navItem}
        onPress={() => router.push(href as any)}
        activeOpacity={0.7}
      >
        <View style={s.navIconWrap}>
          <Icon size={22} weight={active ? "fill" : "regular"} color={active ? C.yellow : C.midGray} />
          {href === "/alerts" && pendingCount > 0 && (
            <View style={s.badge2}>
              <Text style={s.badge2Text}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <Text style={[s.navLabel, active && s.navLabelActive]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[s.nav, { paddingBottom: insets.bottom + 6 }]}>
      {LEFT_ITEMS.map(item => <NavItem key={item.href} {...item} />)}

      {RIGHT_ITEMS.map(item => <NavItem key={item.href} {...item} />)}
    </View>
  )
}

// ── EventDetectionCard ────────────────────────────────────────

export function EventDetectionCard({
  room, participants, datetime, preview, onPress,
}: {
  room: string; participants: number; datetime: string; preview: string; onPress: () => void
}) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.cardHeader}>
        <View style={s.cardDot} />
        <Text style={s.cardRoom}>{room}</Text>
        <Text style={s.cardParticipants}>{participants}명</Text>
      </View>
      <Text style={s.cardDatetime}>{datetime}</Text>
      <Text style={s.cardPreview} numberOfLines={2}>{preview}</Text>
    </TouchableOpacity>
  )
}

// ── styles ────────────────────────────────────────────────────

const s = StyleSheet.create({
  avatar: {
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
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
  spinnerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  badge: {
    backgroundColor: C.ultraLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  badgeImportant: {
    backgroundColor: C.yellowLight,
  },
  badgeText: {
    fontSize: 12,
    color: C.darkGray,
    fontWeight: "600",
  },
  badgeTextImportant: {
    color: C.yellowDark,
  },
  nav: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.lightGray,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingBottom: 2,
  },
  navIconWrap: {
    position: "relative",
  },
  navLabel: {
    fontSize: 10,
    color: C.midGray,
    fontWeight: "500",
  },
  navLabelActive: {
    color: C.yellow,
    fontWeight: "700",
  },
  badge2: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badge2Text: {
    fontSize: 9,
    color: C.white,
    fontWeight: "700",
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: C.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.yellow,
  },
  cardRoom: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: C.black,
  },
  cardParticipants: {
    fontSize: 11,
    color: C.midGray,
    fontWeight: "500",
  },
  cardDatetime: {
    fontSize: 12,
    color: C.yellow,
    fontWeight: "600",
  },
  cardPreview: {
    fontSize: 13,
    color: C.darkGray,
    lineHeight: 18,
  },
})

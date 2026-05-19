import SplashScreen from "@/components/tcm/SplashScreen"
import HomeScreen from "@/components/tcm/HomeScreen"
import DetectionSheet from "@/components/tcm/DetectionSheet"
import CalendarScreen from "@/components/tcm/CalendarScreen"
import EventDetailScreen from "@/components/tcm/EventDetailScreen"
import SettingsScreen from "@/components/tcm/SettingsScreen"

const screens = [
  { id: 1, label: "Screen 1", sublabel: "Splash / Onboarding",  route: "/splash",       component: <SplashScreen /> },
  { id: 2, label: "Screen 2", sublabel: "Home Dashboard",        route: "/home",         component: <HomeScreen /> },
  { id: 3, label: "Screen 3", sublabel: "AI 약속 감지 알림",     route: "/alerts/demo",  component: <DetectionSheet /> },
  { id: 4, label: "Screen 4", sublabel: "Calendar View",         route: "/calendar",     component: <CalendarScreen /> },
  { id: 5, label: "Screen 5", sublabel: "Event Detail / Edit",   route: "/events/demo",  component: <EventDetailScreen /> },
  { id: 6, label: "Screen 6", sublabel: "Settings",              route: "/settings",     component: <SettingsScreen /> },
]

function PhoneFrame({
  children,
  label,
  sublabel,
  route,
}: {
  children: React.ReactNode
  label: string
  sublabel: string
  route: string
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold text-white/40 tracking-widest uppercase">{label}</span>
        <span className="text-sm font-semibold text-white/80">{sublabel}</span>
      </div>

      <div
        className="relative rounded-[44px] overflow-hidden flex-shrink-0"
        style={{
          width: 390,
          height: 844,
          background: "#1A1A1A",
          boxShadow: "0 0 0 2px #333, 0 0 0 4px #111, 0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Dynamic island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black rounded-full" style={{ width: 126, height: 37 }} />
        {/* Status bar */}
        <div className="absolute top-4 left-7 z-20 text-white text-[13px] font-semibold">9:41</div>
        <div className="absolute top-4 right-6 z-20 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[3, 4, 4, 3].map((h, i) => (
              <div key={i} className="w-[3px] rounded-sm bg-white" style={{ height: h, opacity: i === 3 ? 0.4 : 1 }} />
            ))}
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.2 1.2 5 0 8 0s5.8 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4zM8 6.4c-1.4 0-2.6.6-3.4 1.4L3 6.2C4.2 5 6 4.4 8 4.4s3.8.6 5 1.8L11.4 7.8C10.6 7 9.4 6.4 8 6.4zM8 10.4c-.8 0-1.4.4-1.8.8L8 12l1.8-1c-.4-.4-1-.6-1.8-.6z"/>
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="h-3 rounded-sm bg-white" style={{ width: 22 }} />
            <div className="h-1.5 rounded-sm bg-white/50" style={{ width: 3 }} />
          </div>
        </div>
        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden rounded-[44px]">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-32 h-1 rounded-full bg-white/30" />
      </div>

      {/* 라이브 페이지 링크 */}
      <a
        href={route}
        className="text-[12px] text-[#EAB308] font-semibold underline-offset-2 hover:underline"
      >
        라이브 보기 →
      </a>
    </div>
  )
}

export default function DesignPage() {
  return (
    <main
      className="min-h-screen py-16 px-8"
      style={{ background: "linear-gradient(135deg, #18181B 0%, #27272A 50%, #1C1C1E 100%)" }}
    >
      {/* 헤더 */}
      <div className="flex flex-col items-center gap-3 mb-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[#EAB308] flex items-center justify-center">
            <span className="text-[#1A1A1A] font-black text-[14px]">TCM</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Talk-to-Calendar Manager</h1>
        </div>
        <p className="text-white/50 text-[15px]">카카오톡 메신저를 AI가 분석해 캘린더에 자동 저장합니다</p>
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          {["Next.js 16", "Pretendard", "Phosphor Icons", "shadcn/ui", "Supabase"].map((tag) => (
            <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 화면 그리드 */}
      <div className="flex flex-wrap justify-center gap-10">
        {screens.map(({ id, label, sublabel, route, component }) => (
          <PhoneFrame key={id} label={label} sublabel={sublabel} route={route}>
            {component}
          </PhoneFrame>
        ))}
      </div>

      {/* 푸터 */}
      <div className="flex justify-center mt-16">
        <p className="text-white/20 text-[12px]">TCM Design System · 6 Screens · Developer Handoff Ready</p>
      </div>
    </main>
  )
}

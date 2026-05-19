// 폰 프레임 레이아웃 — auth 가드 없이 항상 렌더링
// 로그인 여부는 각 페이지에서 판단해 데이터를 전환합니다.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#18181B] md:flex md:items-center md:justify-center md:p-8">
      <div
        className="relative bg-[#FAFAFA] overflow-hidden w-full h-[100dvh] md:w-[390px] md:h-[844px] md:rounded-[44px]"
        style={{ boxShadow: "0 0 0 2px #333, 0 0 0 4px #111, 0 30px 80px rgba(0,0,0,0.6)" }}
      >
        {/* Dynamic Island (데스크톱만) */}
        <div
          className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-black rounded-full"
          style={{ width: 126, height: 37 }}
        />
        <div className="absolute inset-0 md:rounded-[44px] overflow-hidden flex flex-col">
          {children}
        </div>
        {/* Home indicator (데스크톱만) */}
        <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-32 h-1 rounded-full bg-black/20" />
      </div>
    </div>
  )
}

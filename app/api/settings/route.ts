import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function getOrCreate() {
  let s = await prisma.settings.findUnique({ where: { id: 1 } })
  if (!s) s = await prisma.settings.create({ data: { id: 1 } })
  return s
}

export async function GET() {
  try {
    return NextResponse.json(await getOrCreate())
  } catch {
    return NextResponse.json({ id: 1, userName: "사용자", aiSensitivity: "high", googleCalendarConnected: false, kakaoConnected: false })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  try {
    await getOrCreate()
    const s = await prisma.settings.update({
      where: { id: 1 },
      data: {
        ...(body.user_name !== undefined && { userName: body.user_name }),
        ...(body.ai_sensitivity !== undefined && { aiSensitivity: body.ai_sensitivity }),
        ...(body.google_calendar_connected !== undefined && { googleCalendarConnected: body.google_calendar_connected }),
        ...(body.kakao_connected !== undefined && { kakaoConnected: body.kakao_connected }),
      },
    })
    return NextResponse.json(s)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

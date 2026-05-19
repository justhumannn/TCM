import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = searchParams.get("year")
  const month = searchParams.get("month")

  try {
    const where = year && month
      ? {
          eventDate: {
            gte: `${year}-${String(month).padStart(2, "0")}-01`,
            lte: `${year}-${String(month).padStart(2, "0")}-31`,
          },
        }
      : {}

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { eventDate: "asc" },
    })

    return NextResponse.json(events.map(e => ({
      ...e,
      participants: e.participants ? JSON.parse(e.participants) : null,
    })))
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title ?? "새 일정",
        eventDate: body.event_date,
        eventTime: body.event_time ?? null,
        location: body.location ?? null,
        participants: body.participants ? JSON.stringify(body.participants) : null,
        purpose: body.purpose ?? null,
        memo: body.memo ?? null,
        isAiGenerated: body.is_ai_generated ?? false,
        importance: body.importance ?? "normal",
        detectedEventId: body.detected_event_id ?? null,
      },
    })
    return NextResponse.json({ ...event, participants: body.participants ?? null })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

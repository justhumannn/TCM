import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const det = await prisma.detectedEvent.findUnique({ where: { id } })
    if (!det) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const event = await prisma.calendarEvent.create({
      data: {
        detectedEventId: det.id,
        title: det.extractedTitle ?? "새 일정",
        eventDate: det.extractedDate ?? new Date().toISOString().split("T")[0],
        eventTime: det.extractedTime ?? null,
        location: det.extractedLocation ?? null,
        participants: det.extractedParticipants ?? null,
        purpose: det.extractedPurpose ?? null,
        isAiGenerated: true,
        importance: "normal",
      },
    })

    await prisma.detectedEvent.update({
      where: { id },
      data: { status: "saved", reviewedAt: new Date() },
    })

    return NextResponse.json({
      ...event,
      participants: event.participants ? JSON.parse(event.participants) : null,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

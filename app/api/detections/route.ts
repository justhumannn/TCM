import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const detections = await prisma.detectedEvent.findMany({
      where: { status: "pending" },
      orderBy: { detectedAt: "desc" },
    })
    return NextResponse.json(detections.map(d => ({
      ...d,
      extractedParticipants: d.extractedParticipants ? JSON.parse(d.extractedParticipants) : null,
    })))
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const det = await prisma.detectedEvent.create({
      data: {
        aiConfidence: body.ai_confidence ?? 0.9,
        status: "pending",
        extractedTitle: body.extracted_title ?? null,
        extractedDate: body.extracted_date ?? null,
        extractedTime: body.extracted_time ?? null,
        extractedLocation: body.extracted_location ?? null,
        extractedParticipants: body.extracted_participants ? JSON.stringify(body.extracted_participants) : null,
        extractedPurpose: body.extracted_purpose ?? null,
      },
    })
    return NextResponse.json({ ...det, extractedParticipants: body.extracted_participants ?? null })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

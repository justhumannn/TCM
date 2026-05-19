import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const det = await prisma.detectedEvent.findUnique({ where: { id } })
    if (!det) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({
      ...det,
      extractedParticipants: det.extractedParticipants ? JSON.parse(det.extractedParticipants) : null,
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const det = await prisma.detectedEvent.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.status !== "pending" && { reviewedAt: new Date() }),
      },
    })
    return NextResponse.json(det)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

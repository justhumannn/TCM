import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const event = await prisma.calendarEvent.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ...event, participants: event.participants ? JSON.parse(event.participants) : null })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.event_time !== undefined && { eventTime: body.event_time }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.memo !== undefined && { memo: body.memo }),
        ...(body.importance && { importance: body.importance }),
        ...(body.participants && { participants: JSON.stringify(body.participants) }),
      },
    })
    return NextResponse.json({ ...event, participants: event.participants ? JSON.parse(event.participants) : null })
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.calendarEvent.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

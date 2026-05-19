import * as SQLite from "expo-sqlite"
import type { CalendarEvent, DetectedEvent, Settings } from "./types"

let _db: SQLite.SQLiteDatabase | null = null

function getDb() {
  if (!_db) _db = SQLite.openDatabaseSync("tcm.db")
  return _db
}

export function initDb() {
  const db = getDb()
  db.execSync(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT,
      location TEXT,
      participants TEXT,
      purpose TEXT,
      memo TEXT,
      is_ai_generated INTEGER NOT NULL DEFAULT 0,
      importance TEXT NOT NULL DEFAULT 'normal',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS detected_events (
      id TEXT PRIMARY KEY,
      ai_confidence REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      extracted_title TEXT,
      extracted_date TEXT,
      extracted_time TEXT,
      extracted_location TEXT,
      extracted_participants TEXT,
      extracted_purpose TEXT,
      detected_at TEXT NOT NULL,
      reviewed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      user_name TEXT NOT NULL DEFAULT '사용자',
      ai_sensitivity TEXT NOT NULL DEFAULT 'high',
      google_calendar_connected INTEGER NOT NULL DEFAULT 0,
      kakao_connected INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO settings (id) VALUES (1);
  `)
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Calendar Events ───────────────────────────────────────────

export function dbGetEvents(year: number, month: number): CalendarEvent[] {
  const db = getDb()
  const prefix = `${year}-${String(month).padStart(2, "0")}`
  const rows = db.getAllSync<any>(
    "SELECT * FROM calendar_events WHERE event_date LIKE ? ORDER BY event_date, event_time",
    [`${prefix}%`]
  )
  return rows.map(rowToEvent)
}

export function dbGetEvent(id: string): CalendarEvent | null {
  const db = getDb()
  const row = db.getFirstSync<any>("SELECT * FROM calendar_events WHERE id = ?", [id])
  return row ? rowToEvent(row) : null
}

export function dbCreateEvent(data: Omit<CalendarEvent, "id" | "created_at" | "updated_at">): CalendarEvent {
  const db = getDb()
  const id = uid()
  const now = new Date().toISOString()
  db.runSync(
    `INSERT INTO calendar_events (id,title,event_date,event_time,location,participants,purpose,memo,is_ai_generated,importance,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, data.title, data.event_date, data.event_time ?? null,
     data.location ?? null, JSON.stringify(data.participants ?? null),
     data.purpose ?? null, data.memo ?? null,
     data.is_ai_generated ? 1 : 0, data.importance, now, now]
  )
  return dbGetEvent(id)!
}

export function dbUpdateEvent(id: string, data: Partial<CalendarEvent>): void {
  const db = getDb()
  const now = new Date().toISOString()
  const sets: string[] = []
  const vals: any[] = []
  if (data.title !== undefined) { sets.push("title=?"); vals.push(data.title) }
  if (data.location !== undefined) { sets.push("location=?"); vals.push(data.location) }
  if (data.memo !== undefined) { sets.push("memo=?"); vals.push(data.memo) }
  if (data.importance !== undefined) { sets.push("importance=?"); vals.push(data.importance) }
  sets.push("updated_at=?"); vals.push(now)
  vals.push(id)
  db.runSync(`UPDATE calendar_events SET ${sets.join(",")} WHERE id=?`, vals)
}

export function dbDeleteEvent(id: string): void {
  getDb().runSync("DELETE FROM calendar_events WHERE id=?", [id])
}

// ── Detected Events ───────────────────────────────────────────

export function dbGetPendingDetections(): DetectedEvent[] {
  const rows = getDb().getAllSync<any>(
    "SELECT * FROM detected_events WHERE status='pending' ORDER BY detected_at DESC"
  )
  return rows.map(rowToDet)
}

export function dbGetDetection(id: string): DetectedEvent | null {
  const row = getDb().getFirstSync<any>("SELECT * FROM detected_events WHERE id=?", [id])
  return row ? rowToDet(row) : null
}

export function dbCreateDetection(data: Partial<DetectedEvent>): DetectedEvent {
  const db = getDb()
  const id = uid()
  const now = new Date().toISOString()
  db.runSync(
    `INSERT INTO detected_events (id,ai_confidence,status,extracted_title,extracted_date,extracted_time,extracted_location,extracted_participants,extracted_purpose,detected_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, data.ai_confidence ?? 0.9, "pending",
     data.extracted_title ?? null, data.extracted_date ?? null,
     data.extracted_time ?? null, data.extracted_location ?? null,
     JSON.stringify(data.extracted_participants ?? null),
     data.extracted_purpose ?? null, now]
  )
  return dbGetDetection(id)!
}

export function dbSaveDetection(id: string): CalendarEvent {
  const det = dbGetDetection(id)
  if (!det) throw new Error("Detection not found")
  const event = dbCreateEvent({
    title: det.extracted_title ?? "새 일정",
    event_date: det.extracted_date ?? new Date().toISOString().split("T")[0],
    event_time: det.extracted_time ?? null,
    location: det.extracted_location ?? null,
    participants: det.extracted_participants,
    purpose: det.extracted_purpose ?? null,
    memo: null,
    is_ai_generated: true,
    importance: "normal",
  })
  getDb().runSync(
    "UPDATE detected_events SET status='saved', reviewed_at=? WHERE id=?",
    [new Date().toISOString(), id]
  )
  return event
}

export function dbDismissDetection(id: string): void {
  getDb().runSync(
    "UPDATE detected_events SET status='dismissed', reviewed_at=? WHERE id=?",
    [new Date().toISOString(), id]
  )
}

// ── Settings ──────────────────────────────────────────────────

export function dbGetSettings(): Settings {
  const row = getDb().getFirstSync<any>("SELECT * FROM settings WHERE id=1")
  if (!row) return { userName: "사용자", aiSensitivity: "high", googleCalendarConnected: false, kakaoConnected: false }
  return {
    userName: row.user_name,
    aiSensitivity: row.ai_sensitivity,
    googleCalendarConnected: !!row.google_calendar_connected,
    kakaoConnected: !!row.kakao_connected,
  }
}

export function dbUpdateSettings(data: Partial<Settings>): void {
  const db = getDb()
  const sets: string[] = []
  const vals: any[] = []
  if (data.userName !== undefined) { sets.push("user_name=?"); vals.push(data.userName) }
  if (data.aiSensitivity !== undefined) { sets.push("ai_sensitivity=?"); vals.push(data.aiSensitivity) }
  if (data.googleCalendarConnected !== undefined) { sets.push("google_calendar_connected=?"); vals.push(data.googleCalendarConnected ? 1 : 0) }
  if (data.kakaoConnected !== undefined) { sets.push("kakao_connected=?"); vals.push(data.kakaoConnected ? 1 : 0) }
  if (!sets.length) return
  vals.push(1)
  db.runSync(`UPDATE settings SET ${sets.join(",")} WHERE id=?`, vals)
}

// ── row mappers ───────────────────────────────────────────────

function rowToEvent(r: any): CalendarEvent {
  return {
    ...r,
    participants: r.participants ? JSON.parse(r.participants) : null,
    is_ai_generated: !!r.is_ai_generated,
  }
}

function rowToDet(r: any): DetectedEvent {
  return {
    ...r,
    extracted_participants: r.extracted_participants ? JSON.parse(r.extracted_participants) : null,
  }
}

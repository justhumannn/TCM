-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "detected_event_id" TEXT,
    "title" TEXT NOT NULL,
    "event_date" TEXT NOT NULL,
    "event_time" TEXT,
    "location" TEXT,
    "participants" TEXT,
    "purpose" TEXT,
    "memo" TEXT,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "importance" TEXT NOT NULL DEFAULT 'normal',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "detected_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ai_confidence" REAL NOT NULL DEFAULT 0.9,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "extracted_title" TEXT,
    "extracted_date" TEXT,
    "extracted_time" TEXT,
    "extracted_location" TEXT,
    "extracted_participants" TEXT,
    "extracted_purpose" TEXT,
    "detected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" DATETIME
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "user_name" TEXT NOT NULL DEFAULT '사용자',
    "ai_sensitivity" TEXT NOT NULL DEFAULT 'high',
    "google_calendar_connected" BOOLEAN NOT NULL DEFAULT false,
    "kakao_connected" BOOLEAN NOT NULL DEFAULT false
);

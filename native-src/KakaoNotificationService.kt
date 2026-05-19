package com.tcm.app

import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import android.content.Intent
import android.util.Log

class KakaoNotificationService : NotificationListenerService() {

    companion object {
        const val ACTION = "TCM_KAKAO_MESSAGE"
        const val KAKAO_PACKAGE = "com.kakao.talk"
        private const val TAG = "KakaoNotifService"
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null || sbn.packageName != KAKAO_PACKAGE) return

        val extras = sbn.notification?.extras ?: return
        val sender = extras.getString("android.title") ?: return
        if (sender.isBlank()) return

        // 1. android.messages 배열 (MessagingStyle) — 최신 카카오톡 기본 형식
        var text = extractFromMessagesArray(extras)

        // 2. android.bigText — 일부 구버전
        if (text.isBlank()) {
            text = extras.getCharSequence("android.bigText")?.toString() ?: ""
        }

        // 3. android.text — 마지막 fallback
        if (text.isBlank()) {
            text = extras.getCharSequence("android.text")?.toString() ?: ""
        }

        if (text.isBlank()) return

        // 암호화됐거나 시스템 안내 문구 제거
        if (isEncryptedOrSystem(text)) {
            Log.d(TAG, "Skipped (encrypted/system): $text")
            return
        }

        // 1:1 채팅은 subText 없음 → sender가 곧 room
        val room = extras.getCharSequence("android.subText")?.toString()
            ?: extras.getCharSequence("android.summaryText")?.toString()
            ?: sender

        Log.d(TAG, "[$room] $sender: $text")

        val intent = Intent(ACTION).apply {
            putExtra("sender", sender)
            putExtra("message", text)
            putExtra("room", room)
            putExtra("timestamp", System.currentTimeMillis())
            putExtra("source", "notification")
        }
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
    }

    @Suppress("DEPRECATION")
    private fun extractFromMessagesArray(extras: Bundle): String {
        return try {
            val messages = extras.getParcelableArray("android.messages") ?: return ""
            if (messages.isEmpty()) return ""
            (messages.last() as? Bundle)
                ?.getCharSequence("text")
                ?.toString() ?: ""
        } catch (e: Exception) {
            Log.w(TAG, "extractFromMessagesArray: ${e.message}")
            ""
        }
    }

    private fun isEncryptedOrSystem(text: String): Boolean {
        if (text.length < 2) return true
        val systemPhrases = listOf(
            "새 메시지", "새로운 메시지", "메시지 도착",
            "new message", "카카오톡", "톡이 왔습니다",
            "읽지 않은 메시지", "개의 메시지"
        )
        return systemPhrases.any { text.contains(it) }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {}
}

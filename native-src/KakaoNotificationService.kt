package com.tcm.app

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
        val sender = extras.getString("android.title") ?: ""
        val text   = extras.getCharSequence("android.text")?.toString() ?: ""
        val subText = extras.getCharSequence("android.subText")?.toString()
            ?: extras.getCharSequence("android.summaryText")?.toString()
            ?: "(개인 채팅)"

        if (text.isBlank()) return

        Log.d(TAG, "[$subText] $sender: $text")

        val intent = Intent(ACTION).apply {
            putExtra("sender", sender)
            putExtra("message", text)
            putExtra("room", subText)
            putExtra("timestamp", System.currentTimeMillis())
            putExtra("source", "notification")
        }
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }
}

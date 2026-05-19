package com.tcm.app

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import android.content.Intent
import android.util.Log

class KakaoAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "KakaoA11yService"
        private const val KAKAO_PACKAGE = "com.kakao.talk"
    }

    // 중복 메시지 방지용 마지막 메시지 캐시
    private var lastMessage = ""
    private var lastSender = ""

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.packageName?.toString() != KAKAO_PACKAGE) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                extractMessages(event.source)
            }
        }
    }

    private fun extractMessages(root: AccessibilityNodeInfo?) {
        if (root == null) return

        // 카카오톡 채팅 메시지 뷰 탐색
        val messages = mutableListOf<Pair<String, String>>() // sender, message

        fun traverse(node: AccessibilityNodeInfo) {
            val className = node.className?.toString() ?: ""
            val text = node.text?.toString() ?: ""
            val viewId = node.viewIdResourceName ?: ""

            // 메시지 텍스트 노드 판별 (카카오톡 내부 뷰ID 패턴)
            if (className == "android.widget.TextView" && text.isNotBlank()) {
                // 시스템 메시지나 타임스탬프 제외
                if (text.length > 1 && !text.matches(Regex("\\d{1,2}:\\d{2}"))) {
                    val parent = node.parent
                    val parentClass = parent?.className?.toString() ?: ""
                    // 발신자와 메시지 구분
                    if (viewId.contains("chat_item_name") || viewId.contains("name")) {
                        messages.lastOrNull()?.let { /* sender node */ }
                    } else if (viewId.contains("chat_item_text") || viewId.contains("message")) {
                        if (messages.isNotEmpty()) {
                            // 이미 발신자가 기록된 경우
                        } else {
                            messages.add(Pair("", text))
                        }
                    } else {
                        // 일반 텍스트 추가
                        messages.add(Pair("", text))
                    }
                }
            }

            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                traverse(child)
            }
        }

        traverse(root)

        // 최신 메시지만 추출 (마지막 비어있지 않은 텍스트)
        val latestText = messages.lastOrNull { it.second.isNotBlank() }?.second ?: return
        if (latestText == lastMessage) return
        lastMessage = latestText

        Log.d(TAG, "접근성 메시지 감지: $latestText")

        val intent = Intent(KakaoNotificationService.ACTION).apply {
            putExtra("sender", "")
            putExtra("message", latestText)
            putExtra("room", "카카오톡")
            putExtra("timestamp", System.currentTimeMillis())
            putExtra("source", "accessibility")
        }
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
    }

    override fun onInterrupt() {
        Log.d(TAG, "AccessibilityService interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "AccessibilityService connected")
    }
}

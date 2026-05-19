package com.tcm.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.provider.Settings
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class KakaoListenerModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    private val broadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            intent ?: return
            try {
                val params = Arguments.createMap().apply {
                    putString("sender",    intent.getStringExtra("sender") ?: "")
                    putString("message",   intent.getStringExtra("message") ?: "")
                    putString("room",      intent.getStringExtra("room") ?: "")
                    putDouble("timestamp", intent.getLongExtra("timestamp", 0L).toDouble())
                    putString("source",    intent.getStringExtra("source") ?: "")
                }
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("KakaoMessage", params)
            } catch (_: Exception) {}
        }
    }

    init {
        // 모듈 생성 시 즉시 등록 — JS startListening() 호출 전에도 수신 가능
        LocalBroadcastManager.getInstance(reactContext)
            .registerReceiver(broadcastReceiver, IntentFilter(KakaoNotificationService.ACTION))
    }

    override fun getName() = "KakaoListener"

    @ReactMethod
    fun startListening(promise: Promise) {
        // 이미 init에서 등록됨 — 호환성 유지용
        promise.resolve("started")
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        promise.resolve("stopped")
    }

    @ReactMethod
    fun checkNotificationPermission(promise: Promise) {
        val enabled = Settings.Secure.getString(
            reactContext.contentResolver,
            "enabled_notification_listeners"
        ) ?: ""
        promise.resolve(enabled.contains(reactContext.packageName))
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        val enabled = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: ""
        promise.resolve(enabled.contains(reactContext.packageName))
    }

    @ReactMethod
    fun openNotificationSettings() {
        reactContext.startActivity(
            Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
        )
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        reactContext.startActivity(
            Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
        )
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    override fun onCatalystInstanceDestroy() {
        try {
            LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(broadcastReceiver)
        } catch (_: Exception) {}
    }
}

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

    private var broadcastReceiver: BroadcastReceiver? = null

    override fun getName() = "KakaoListener"

    // JS에서 호출: 리스너 시작
    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            if (broadcastReceiver != null) {
                promise.resolve("already_listening")
                return
            }
            broadcastReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    intent ?: return
                    val params = Arguments.createMap().apply {
                        putString("sender",    intent.getStringExtra("sender") ?: "")
                        putString("message",   intent.getStringExtra("message") ?: "")
                        putString("room",      intent.getStringExtra("room") ?: "")
                        putDouble("timestamp", intent.getLongExtra("timestamp", 0L).toDouble())
                        putString("source",    intent.getStringExtra("source") ?: "")
                    }
                    sendEvent("KakaoMessage", params)
                }
            }
            LocalBroadcastManager.getInstance(reactContext)
                .registerReceiver(broadcastReceiver!!, IntentFilter(KakaoNotificationService.ACTION))
            promise.resolve("started")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // JS에서 호출: 리스너 중지
    @ReactMethod
    fun stopListening(promise: Promise) {
        broadcastReceiver?.let {
            LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(it)
            broadcastReceiver = null
        }
        promise.resolve("stopped")
    }

    // 알림 접근 권한 확인
    @ReactMethod
    fun checkNotificationPermission(promise: Promise) {
        val enabledListeners = Settings.Secure.getString(
            reactContext.contentResolver,
            "enabled_notification_listeners"
        ) ?: ""
        promise.resolve(enabledListeners.contains(reactContext.packageName))
    }

    // 접근성 서비스 권한 확인
    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        val enabledServices = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: ""
        promise.resolve(enabledServices.contains(reactContext.packageName))
    }

    // 알림 접근 설정 화면 열기
    @ReactMethod
    fun openNotificationSettings() {
        val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    // 접근성 설정 화면 열기
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // DeviceEventEmitter 리스너 등록 필수 오버라이드
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    override fun onCatalystInstanceDestroy() {
        broadcastReceiver?.let {
            LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(it)
            broadcastReceiver = null
        }
    }
}

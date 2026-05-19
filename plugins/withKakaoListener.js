const { withAndroidManifest, withMainApplication, withDangerousMod } = require("@expo/config-plugins")
const path = require("path")
const fs = require("fs")

// AndroidManifest.xml에 서비스 및 권한 추가
function addKakaoServices(config) {
  return withAndroidManifest(config, async (cfg) => {
    const manifest = cfg.modResults
    const app = manifest.manifest.application[0]

    // 기존 서비스 중복 방지
    const services = app.service || []
    const hasNotifService = services.some(s =>
      s.$?.["android:name"]?.includes("KakaoNotificationService")
    )
    const hasAccService = services.some(s =>
      s.$?.["android:name"]?.includes("KakaoAccessibilityService")
    )

    if (!hasNotifService) {
      services.push({
        $: {
          "android:name": ".KakaoNotificationService",
          "android:label": "TCM 알림 수신",
          "android:exported": "true",
          "android:permission": "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.service.notification.NotificationListenerService" } },
            ],
          },
        ],
      })
    }

    if (!hasAccService) {
      services.push({
        $: {
          "android:name": ".KakaoAccessibilityService",
          "android:label": "TCM 접근성",
          "android:exported": "true",
          "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.accessibilityservice.AccessibilityService" } },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.accessibilityservice",
              "android:resource": "@xml/accessibility_service_config",
            },
          },
        ],
      })
    }

    app.service = services
    return cfg
  })
}

// MainApplication에 KakaoListenerPackage 등록
function addKakaoPackage(config) {
  return withMainApplication(config, (cfg) => {
    if (cfg.modResults.language === "java") {
      let contents = cfg.modResults.contents

      if (!contents.includes("KakaoListenerPackage")) {
        contents = contents.replace(
          "import com.facebook.react.ReactApplication;",
          `import com.facebook.react.ReactApplication;\nimport com.tcm.app.KakaoListenerPackage;`
        )
        contents = contents.replace(
          "new DefaultReactNativeHost(this) {",
          `new DefaultReactNativeHost(this) {\n          @Override\n          protected List<ReactPackage> getPackages() {\n            List<ReactPackage> packages = new PackageList(this).getPackages();\n            packages.add(new KakaoListenerPackage());\n            return packages;\n          }`
        )
        // 이미 getPackages가 있는 경우를 위한 대안
        if (!contents.includes("KakaoListenerPackage()")) {
          // 안전하게 찾아서 추가
          contents = contents.replace(
            "packages.add(new MainReactPackage());",
            `packages.add(new MainReactPackage());\n            packages.add(new KakaoListenerPackage());`
          )
        }
        cfg.modResults.contents = contents
      }
    } else {
      // Kotlin
      let contents = cfg.modResults.contents
      if (!contents.includes("KakaoListenerPackage")) {
        contents = contents.replace(
          "import com.facebook.react.ReactApplication",
          `import com.facebook.react.ReactApplication\nimport com.tcm.app.KakaoListenerPackage`
        )
        cfg.modResults.contents = contents
      }
    }
    return cfg
  })
}

// accessibility_service_config.xml 파일 생성
function addAccessibilityConfig(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const xmlDir = path.join(cfg.modRequest.platformProjectRoot, "app/src/main/res/xml")
      fs.mkdirSync(xmlDir, { recursive: true })
      const xmlPath = path.join(xmlDir, "accessibility_service_config.xml")
      if (!fs.existsSync(xmlPath)) {
        fs.writeFileSync(
          xmlPath,
          `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeWindowContentChanged|typeWindowStateChanged|typeViewScrolled"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="200"
    android:canRetrieveWindowContent="true"
    android:accessibilityFlags="flagReportViewIds|flagRetrieveInteractiveWindows"
    android:packageNames="com.kakao.talk" />`
        )
      }
      return cfg
    },
  ])
}

// Java 소스 파일 복사
function addKakaoJavaSources(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const javaDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/java/com/tcm/app"
      )
      fs.mkdirSync(javaDir, { recursive: true })

      // 파일들은 별도 scripts에서 복사 (빌드 시 플러그인이 다시 실행되므로 여기서만 체크)
      return cfg
    },
  ])
}

module.exports = (config) => {
  config = addKakaoServices(config)
  config = addKakaoPackage(config)
  config = addAccessibilityConfig(config)
  return config
}

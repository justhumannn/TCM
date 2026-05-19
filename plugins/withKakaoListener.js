const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins")
const path = require("path")
const fs = require("fs")

// 1. AndroidManifest.xml에 서비스 추가
function addKakaoServices(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0]
    const services = app.service || []

    if (!services.some(s => s.$?.["android:name"]?.includes("KakaoNotificationService"))) {
      services.push({
        $: {
          "android:name": ".KakaoNotificationService",
          "android:label": "TCM 알림 수신",
          "android:exported": "true",
          "android:permission": "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        },
        "intent-filter": [{
          action: [{ $: { "android:name": "android.service.notification.NotificationListenerService" } }],
        }],
      })
    }

    if (!services.some(s => s.$?.["android:name"]?.includes("KakaoAccessibilityService"))) {
      services.push({
        $: {
          "android:name": ".KakaoAccessibilityService",
          "android:label": "TCM 접근성",
          "android:exported": "true",
          "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
        },
        "intent-filter": [{
          action: [{ $: { "android:name": "android.accessibilityservice.AccessibilityService" } }],
        }],
        "meta-data": [{
          $: {
            "android:name": "android.accessibilityservice",
            "android:resource": "@xml/accessibility_service_config",
          },
        }],
      })
    }

    app.service = services
    return cfg
  })
}

// 2. accessibility_service_config.xml 생성 + strings.xml에 문자열 추가
function addAccessibilityResources(config) {
  return withDangerousMod(config, ["android", (cfg) => {
    const resDir = path.join(cfg.modRequest.platformProjectRoot, "app/src/main/res")

    // xml/accessibility_service_config.xml
    const xmlDir = path.join(resDir, "xml")
    fs.mkdirSync(xmlDir, { recursive: true })
    fs.writeFileSync(
      path.join(xmlDir, "accessibility_service_config.xml"),
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

    // values/strings.xml에 문자열 추가
    const stringsPath = path.join(resDir, "values/strings.xml")
    if (fs.existsSync(stringsPath)) {
      let contents = fs.readFileSync(stringsPath, "utf8")
      if (!contents.includes("accessibility_service_description")) {
        contents = contents.replace(
          "</resources>",
          `    <string name="accessibility_service_description">카카오톡 메시지를 감지해 약속을 자동으로 캘린더에 저장합니다</string>\n</resources>`
        )
        fs.writeFileSync(stringsPath, contents)
      }
    }

    return cfg
  }])
}

// 3. Kotlin 소스 파일 복사 (native-src/ → android/.../com/tcm/app/)
function copyKotlinSources(config) {
  return withDangerousMod(config, ["android", (cfg) => {
    const srcDir = path.join(cfg.modRequest.projectRoot, "native-src")
    const destDir = path.join(
      cfg.modRequest.platformProjectRoot,
      "app/src/main/java/com/tcm/app"
    )
    fs.mkdirSync(destDir, { recursive: true })

    for (const file of fs.readdirSync(srcDir)) {
      if (file.endsWith(".kt")) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
      }
    }
    return cfg
  }])
}

// 4. MainApplication.kt에 KakaoListenerPackage 등록
function addKakaoPackage(config) {
  return withDangerousMod(config, ["android", (cfg) => {
    const appDir = path.join(
      cfg.modRequest.platformProjectRoot,
      "app/src/main/java/com/tcm/app"
    )
    const mainAppPath = path.join(appDir, "MainApplication.kt")
    if (!fs.existsSync(mainAppPath)) return cfg

    let contents = fs.readFileSync(mainAppPath, "utf8")
    if (contents.includes("KakaoListenerPackage")) return cfg

    // import 추가
    contents = contents.replace(
      /^(package com\.tcm\.app)/m,
      `$1\nimport com.tcm.app.KakaoListenerPackage`
    )

    // PackageList(this).packages.apply { ... } 블록 안에 추가
    contents = contents.replace(
      /PackageList\(this\)\.packages\.apply\s*\{/,
      `PackageList(this).packages.apply {\n              add(KakaoListenerPackage())`
    )

    fs.writeFileSync(mainAppPath, contents)
    return cfg
  }])
}

// 5. app/build.gradle에 localbroadcastmanager 의존성 추가
function addBuildGradleDeps(config) {
  return withDangerousMod(config, ["android", (cfg) => {
    const buildGradlePath = path.join(cfg.modRequest.platformProjectRoot, "app/build.gradle")
    if (!fs.existsSync(buildGradlePath)) return cfg

    let contents = fs.readFileSync(buildGradlePath, "utf8")
    if (!contents.includes("localbroadcastmanager")) {
      contents = contents.replace(
        /implementation\("com\.facebook\.react:react-android"\)/,
        `implementation("com.facebook.react:react-android")\n    implementation("androidx.localbroadcastmanager:localbroadcastmanager:1.1.0")`
      )
      fs.writeFileSync(buildGradlePath, contents)
    }
    return cfg
  }])
}

module.exports = (config) => {
  config = addKakaoServices(config)
  config = addAccessibilityResources(config)
  config = copyKotlinSources(config)
  config = addKakaoPackage(config)
  config = addBuildGradleDeps(config)
  return config
}

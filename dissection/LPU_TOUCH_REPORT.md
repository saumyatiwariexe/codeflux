# LPU Touch Mobile Application
## Reverse Engineering & Architecture Report

> **Classification:** Internal Research — Paladeium Project
> **APK:** `LPU+Touch_23.45_APKPure.xapk`
> **Package:** `ums.lovely.university`
> **Version:** 23.45 (version code 234)
> **Investigation Date:** 2026-09-16
> **Method:** Static APK analysis — no dynamic instrumentation, no traffic interception, no device required
> **No credentials were tested, stored, or exploited.**

---

## 1. Overview

LPU Touch is the official mobile application of Lovely Professional University, published by LPU on both the Google Play Store and Apple App Store. It is the primary mobile interface for student academic management.

**Key finding:** LPU Touch is NOT a WebView wrapper of the UMS web portal. It is a fully featured hybrid mobile application with its own Angular/Ionic codebase and a dedicated mobile REST API (`mobileapi.lpu.in`) — separate from the web UMS entirely.

---

## 2. Application Identity

| Field | Value |
|-------|-------|
| App Name | LPU Touch |
| Package Name | `ums.lovely.university` |
| Version | 23.45 |
| Version Code | 234 |
| Min SDK | 22 (Android 5.1 Lollipop) |
| Target SDK | 36 (Android 16) |
| Total Size | 25.5 MB (XAPK bundle) |
| Split APKs | `config.en` (English), `config.mdpi` (MDPI density) |

---

## 3. Technology Stack

### 3.1 Confirmed Framework

| Technology | Confidence | Evidence |
|-----------|-----------|---------|
| **Ionic Framework** | HIGH | 1800+ Ionicons SVG files in `assets/public/svg/` — Ionic's signature icon set |
| **Angular** | HIGH | `NgModule`, `Component`, `Injectable`, `HttpClient`, `ActivatedRoute`, `Router`, `Observable`, `BehaviorSubject` all present in JS bundle |
| **Apache Cordova** | HIGH | `org/apache/cordova/` in APK, `cordova_plugins.js`, 18 Cordova references in bundle |
| **Capacitor** | HIGH | `capacitor.config.json`, `capacitor.plugins.json`, `res/layout/capacitor_bridge_layout_main.xml` |
| **Kotlin** | HIGH | `kotlin/` directory, `DebugProbesKt.bin` (Kotlin coroutines debug probes) |
| **Firebase** | HIGH | 12 Firebase property files (messaging, installations, datatransport, etc.) |

**Architecture summary:** Angular + Ionic + Capacitor + Cordova hybrid app with a Kotlin native bridge layer.

### 3.2 Font

The app uses **Nunito** (regular 400) as its typeface, bundled as WOFF/WOFF2 files:
- `nunito-latin-400-normal.woff2`
- `nunito-cyrillic-400-normal.woff2`
- `nunito-latin-ext-400-normal.woff2`

### 3.3 JavaScript Bundle

| File | Size | Purpose |
|------|------|---------|
| `main.[hash].js` | ~4MB | Complete Angular app — all business logic, services, components, routes |
| `polyfills.[hash].js` | ~150KB | Browser polyfills |
| `runtime.[hash].js` | ~10KB | Angular module loader |
| `styles.[hash].css` | ~200KB | Global Ionic/Angular styles |
| `cordova_plugins.js` | ~20KB | Cordova plugin registry |

---

## 4. APK Internal Structure

```
LPU+Touch_23.45_APKPure.xapk
├── ums.lovely.university.apk    (24.7 MB) — main application
├── config.en.apk                (40 KB)   — English locale
├── config.mdpi.apk              (93 KB)   — MDPI screen density resources
├── icon.png                     (193 KB)  — App launcher icon
└── manifest.json                           — XAPK metadata

ums.lovely.university.apk (internal):
├── AndroidManifest.xml          (17 KB binary)
├── classes.dex                  (3.5 MB) — Kotlin/Java bytecode
├── DebugProbesKt.bin                      — Kotlin coroutines probes
├── firebase-*.properties        (x12)     — Firebase SDK components
├── assets/
│   ├── capacitor.config.json              — Capacitor config
│   ├── capacitor.plugins.json             — Installed plugins list
│   ├── public/
│   │   ├── index.html                     — Angular app shell
│   │   ├── main.[hash].js                 — Full app bundle
│   │   ├── styles.[hash].css
│   │   ├── cordova_plugins.js
│   │   ├── nunito-*.woff2                 — Bundled fonts
│   │   ├── svg/                           — 1800+ Ionicons SVGs
│   │   └── plugins/                       — Cordova JS bridges
│   │       ├── cordova-plugin-advanced-http/
│   │       ├── cordova-plugin-camera/
│   │       ├── cordova-plugin-file/
│   │       ├── cordova-plugin-filechooser/
│   │       ├── cordova-plugin-device/
│   │       ├── cordova-plugin-buildinfo/
│   │       ├── mx.ferreyra.callnumber/
│   │       └── phonegap-plugin-barcodescanner/
│   ├── html-{lang}/             (x14 languages) — Help pages
│   └── dexopt/                              — AOT profiles
├── res/
│   ├── layout/capacitor_bridge_layout_main.xml
│   └── xml/config.xml
└── META-INF/                              — APK signing data
```

---

## 5. Android Permissions

| Permission | Purpose |
|-----------|---------|
| `INTERNET` | All network calls |
| `ACCESS_COARSE_LOCATION` | Campus location features |
| `ACCESS_FINE_LOCATION` | GPS precision |
| `READ_EXTERNAL_STORAGE` | Read files for upload |
| `WRITE_EXTERNAL_STORAGE` | Download files |
| `POST_NOTIFICATIONS` | Firebase push notifications |
| `CAMERA` | QR scanning, face inspection, photo upload |
| `FLASHLIGHT` | Barcode scanner torch |
| `CALL_PHONE` | Direct-dial phone feature |
| `VIBRATE` | Haptic feedback |
| `ACCESS_NETWORK_STATE` | Connectivity checking |
| `USE_BIOMETRIC` | Biometric authentication |
| `USE_FINGERPRINT` | Fingerprint auth (legacy API) |
| `WAKE_LOCK` | Background processing |
| `RECEIVE` (FCM) | Push notification delivery |

---

## 6. Capacitor Plugins

| Plugin Package | Classpath | Capability |
|----------------|-----------|-----------|
| `@capacitor-community/fcm` | `com.getcapacitor.community.fcm.FCMPlugin` | Firebase Cloud Messaging |
| `@capacitor/app` | `AppPlugin` | App lifecycle |
| `@capacitor/camera` | `CameraPlugin` | Native camera |
| `@capacitor/device` | `DevicePlugin` | Device info |
| `@capacitor/filesystem` | `FilesystemPlugin` | File operations |
| `@capacitor/geolocation` | `GeolocationPlugin` | GPS location |
| `@capacitor/haptics` | `HapticsPlugin` | Vibration |
| `@capacitor/keyboard` | `KeyboardPlugin` | Keyboard UX |
| `@capacitor/preferences` | `PreferencesPlugin` | Local key-value storage |
| `@capacitor/push-notifications` | `PushNotificationsPlugin` | Push notifications |
| `@capacitor/splash-screen` | `SplashScreenPlugin` | Splash screen |
| `@capacitor/status-bar` | `StatusBarPlugin` | Status bar styling |
| `capacitor-native-biometric` | `com.epicshaggy.biometric.NativeBiometric` | Fingerprint / Face ID |

---

## 7. Cordova Plugins

| Plugin | Capability | Integration Note |
|--------|-----------|----------------|
| `cordova-plugin-advanced-http` | Native HTTP with cookie management | **Critical:** Bypasses WebView CORS; manages `ASP.NET_SessionId` natively |
| `cordova-plugin-buildinfo` | Build version info | App versioning |
| `cordova-plugin-camera` | Camera access | Photo capture |
| `cordova-plugin-device` | Device information | Platform detection |
| `cordova-plugin-file` | File system | Download/upload |
| `cordova-plugin-filechooser` | File picker | Document upload UI |
| `mx.ferreyra.callnumber` | Direct phone dialing | Contact/helpdesk calls |
| `phonegap-plugin-barcodescanner` | QR / barcode scanner | Attendance, access control |

> `cordova-plugin-advanced-http` is architecturally significant: it makes HTTP requests at the native level (outside the WebView), which means it can manage cookies and bypass CORS restrictions that would otherwise block web-based requests. This is how the app handles `ASP.NET_SessionId` session management without triggering browser CORS errors.

---

## 8. API Endpoints (Extracted from JS Bundle)

### 8.1 Primary Mobile API — `mobileapi.lpu.in`

This is a **dedicated mobile REST API** — entirely separate from the UMS web portal. It is the real integration surface.

| Endpoint | Method | Purpose |
|---------|--------|---------|
| `https://mobileapi.lpu.in/api` | — | API base URL |
| `https://mobileapi.lpu.in/security/createToken` | POST | Primary login — returns `NToken` |
| `https://mobileapi.lpu.in/security/createappToken` | POST | App-specific token generation |
| `https://mobileapi.lpu.in/security/createodlToken` | POST | ODL (distance learning) token |
| `https://mobileapi.lpu.in/security/Validate` | GET/POST | Validate existing token |
| `https://mobileapi.lpu.in/security/FP` | POST | Fingerprint / biometric auth |
| `https://mobileapi.lpu.in/api/Menu/UPS` | GET | User permission set — first call after login |

### 8.2 UMS Web Services

| Endpoint | Type | Purpose |
|---------|------|---------|
| `https://ums.lpu.in/umswebservice/umswebservice.svc` | WCF SOAP | UMS web service |
| `https://ums.lpu.in/umswebservice/umswebservice.svc/PVR` | WCF SOAP | Visitor Pass Registration |

### 8.3 OBP API (Staff-facing)

| Endpoint | Purpose |
|---------|---------|
| `https://ums.lpu.in/obpapi/api/OBPDashboard/GetOBPDashboardStaffAllocations` | Staff dashboard |
| `https://ums.lpu.in/obpapi/api/OBPDashboard/GetOBPDashboardStaffPercentage` | Staff % metrics |
| `https://ums.lpu.in/obpapi/api/OBPDashboard/GetOBPDashboardStaffStageProgress` | Stage progress |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/GetAllocationHead` | Metric allocation |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/GetAllocationAllSelective` | Selective allocation |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/GetAllocationAuthorityList` | Authority list |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/GetPlannerSessionsForMobileAllocation` | Planner sessions |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/SaveOBPAllocation` | Save allocation |
| `https://ums.lpu.in/obpapi/api/MeetingMinutes/GetPlannerSessionsMeetings` | Meeting planner |

### 8.4 WordPress / Happenings Blog

| Endpoint | Purpose |
|---------|---------|
| `https://happenings.lpu.in/wp-json/wp/v2/posts` | LPU Happenings news/events feed |

This is a **public WordPress REST API** — no authentication required. Any app can consume it.

---

## 9. Authentication Architecture

### Token Variables (from JS bundle)

| Variable | Role |
|---------|------|
| `NToken` | Primary mobile API auth token (from `/security/createToken`) |
| `TOKEN` | Generic token storage |
| `TOUCH_ID` | Device fingerprint identifier |
| `DEVICE_ID` | Hardware device identifier |
| `USER_ID` | Student/user numeric ID |
| `USER_TYPE` | Role: student / faculty / staff / admin |
| `PLAYER_ID` | FCM push notification player ID |
| `PSW` | Password field — passed during login, NOT persisted |

### Login Flow (Mobile App)

```
STEP 1 — App Launch
  GET  mobileapi.lpu.in/security/createappToken
  Body: { DEVICE_ID, PLATFORM, ... }
  → Returns: app-level NToken

STEP 2 — User Login
  POST mobileapi.lpu.in/security/createToken
  Body: { RegistrationNo, Password, DEVICE_ID, NToken }
  → Returns: user-scoped NToken

STEP 3 — Fetch User Permissions
  GET  mobileapi.lpu.in/api/Menu/UPS
  Header: Authorization / NToken
  → Returns: user profile + available features (JSON)

STEP 4 — Biometric Login (subsequent)
  POST mobileapi.lpu.in/security/FP
  Body: { biometric_proof, DEVICE_ID }
  → Returns: NToken (skips password re-entry)

STEP 5 — All API Calls
  Header: NToken=[token]
  → Data returned as JSON
```

---

## 10. App Route Map (Angular Router)

All routes extracted from the minified JS bundle. These represent every screen in the app.

### Academic / UMS

| Route | Feature |
|-------|---------|
| `attendance-rectification` | Attendance correction request |
| `academic-calender` | Academic calendar |
| `AssignmentMarks` | Assignment marks view |
| `MarkStudentAttendance` | Faculty attendance marking |
| `NewCourseAttendence` | Current semester attendance |
| `OldAdmitCard` | Historical admit cards |
| `ReappearResult` | Re-appear exam results |
| `SeatingPlan` | Exam seating plan |
| `ebooks` | E-book library |
| `elective-polling` | Elective subject selection |
| `examination-tasks` | Exam-related tasks |
| `announcement` | Announcements list |
| `announcement-details` | Single announcement view |

### Financial

| Route | Feature |
|-------|---------|
| `fee-status` | Fee payment status |
| `fee-receipt` | Fee payment receipts |
| `fee-statement` | Fee account statement |
| `fee-extention` | Fee extension request |
| `fee-undertaking` | Fee undertaking form |
| `fee-undertaking-form` | Fee undertaking submission |

### EduRev / GROW Program

| Route | Feature |
|-------|---------|
| `edu-revolution-start` | EduRev program entry |
| `edu-revolution-categories` | Activity categories |
| `edu-revolution-courses` | Eligible courses |
| `edu-revolution-apply-application` | Apply for benefit |
| `edu-revolution-custom-application` | Custom application |
| `edu-revolution-consent` | Consent form |
| `edu-revolution-gradeupgrade` | Grade upgrade benefit |
| `edu-revolution-track-progress` | Progress tracking |
| `edu-revolution-track-view-details` | Progress detail view |

### Campus Health / Services

| Route | Feature |
|-------|---------|
| `book-appointment` | Doctor/counsellor booking |
| `doctor-appointment` | Doctor appointment management |
| `UnitHospital` | Hospital services |
| `fire-escape` | Emergency fire escape routes |

### Administrative / RMS

| Route | Feature |
|-------|---------|
| `counsellor-rms` | Counsellor request management |
| `counsellor-rms-history` | RMS request history |
| `certificate-request` | Certificate request submission |
| `certificate-old-request-status` | Old request status |
| `certificate-track-request-status` | Track certificate |
| `dpr` | Daily progress report |
| `dpr-fill` | Fill DPR |
| `SelfDevRecord` | Self-development records |
| `PDLTelephonic` | PDL telephonic record |
| `DocumentUpload` | Document upload |
| `WebView` | Embedded web view for legacy pages |

### Profile / Access

| Route | Feature |
|-------|---------|
| `candidate-tabs` | Student profile tabs |
| `dl-qr-generate` | Digital ID / QR code |
| `face-inspection` | Face recognition check-in |
| `ChangeUmsPassword` | Change UMS password |
| `ResetInternetPassword` | Reset internet/Wi-Fi password |
| `forgot-password` | Password recovery |

### Campus / Events

| Route | Feature |
|-------|---------|
| `campuse-tour` | Virtual campus tour |
| `events` | Events listing |
| `cadidate-transport-prefrence` | Transport preference |

### Gamification

| Route | Feature |
|-------|---------|
| `game-dashboard` | Gamification dashboard |
| `game-hos-dashboard` | HOS gamification dashboard |
| `game-leadboard` | Leaderboard |
| `game-coinsledger` | Coins/points ledger |
| `game-parameters` | Game parameters |
| `game-points-detail` | Points detail view |

### LPU NEST (Entrance Exam)

| Route | Feature |
|-------|---------|
| `lpunest-exam-attendance` | NEST exam attendance |
| `lpunest-studenlist` | NEST student list |
| `lpunest-venue` | NEST exam venue |

---

## 11. Third-Party SDKs & Services

| SDK / Service | Evidence | Purpose |
|--------------|---------|---------|
| Firebase Core | 12x property files | Google Firebase platform |
| Firebase Cloud Messaging | `firebase-messaging.properties`, FCM Capacitor plugin | Push notifications |
| Firebase Installations | `firebase-installations.properties` | Device registration |
| Firebase Data Transport | `firebase-datatransport.properties` | Analytics transport |
| Google Play Services — Location | `play-services-location.properties` | Location APIs |
| Google Play Services — Tasks | `play-services-tasks.properties` | Async task management |
| Google Play Services — Basement | `play-services-basement.properties` | Core Google APIs |
| Sentry | Referenced in JS bundle (1 occurrence) | Error / crash tracking |
| Kotlin Coroutines | `DebugProbesKt.bin` | Async Kotlin operations |

---

## 12. Feature Capability Map

| Feature Category | Technology Used | Native or Web |
|----------------|----------------|--------------|
| UI Rendering | Angular + Ionic | Web (WebView) |
| HTTP Requests | cordova-plugin-advanced-http | Native (bypasses CORS) |
| Push Notifications | Firebase Cloud Messaging | Native |
| Biometric Login | capacitor-native-biometric | Native |
| QR/Barcode Scanner | phonegap-plugin-barcodescanner | Native |
| Camera | @capacitor/camera | Native |
| GPS Location | @capacitor/geolocation | Native |
| Local Storage | @capacitor/preferences | Native |
| File System | @capacitor/filesystem | Native |
| Phone Calls | mx.ferreyra.callnumber | Native |
| Haptics | @capacitor/haptics | Native |

---

## 13. Integration Implications for Paladeium

| Finding | Paladeium Action |
|---------|----------------|
| `mobileapi.lpu.in` is a real JSON API | **Use this as primary integration point — not HTML scraping** |
| `/security/createToken` → `NToken` | POST credentials here for hackathon demo auth |
| `/api/Menu/UPS` returns JSON profile | First call after login — user data in JSON |
| EduRev routes exist natively (8 routes) | Validate our EduRev data model against these routes |
| Gamification already in LPU Touch | Differentiate Paladeium with map-based discovery, not generic points |
| `happenings.lpu.in/wp-json/wp/v2/posts` | EventHub can consume this without auth |
| `@capacitor/geolocation` in use | GPS-based features are expected by students |
| Sentry error tracking | LPU Touch is production-quality — Paladeium must match reliability |
| Biometric login in LPU Touch | Students expect biometric; consider for Paladeium login |
| Firebase FCM for push | Use same FCM for Paladeium quest notifications |

### Revised Integration Recommendation

```
OLD (before APK analysis):
  HTML scraping via ASP.NET_SessionId cookie
  → Fragile, breaks on HTML changes, returns HTML not JSON

NEW (after APK analysis):
  POST mobileapi.lpu.in/security/createToken
    { RegistrationNo, Password, DEVICE_ID }
  → Receive NToken (JSON token)
  GET  mobileapi.lpu.in/api/Menu/UPS
    Header: { NToken }
  → Receive student profile as JSON
  → Discard NToken + password immediately
  → Store in Supabase: { name, section, program, timetable }
```

This approach mirrors exactly what LPU Touch itself does — making it the most stable and realistic integration path available without official API access.

---

## 14. What This Changes vs. Web-Only Analysis

| Assumption (Before APK) | Reality (After APK) |
|------------------------|---------------------|
| LPU Touch is a WebView wrapper | Full Angular/Ionic application |
| Only HTML scraping is possible | JSON REST API exists at `mobileapi.lpu.in` |
| Cookie-only auth | Token auth via `NToken` |
| No dedicated mobile API | Fully separate mobile API layer |
| Data returned as HTML | Data returned as JSON |
| Gamification is a Paladeium differentiator | LPU already has gamification (route-level confirmed) |
| EduRev is our idea | EduRev is already in LPU Touch (8 routes) |

---

*Report compiled 2026-09-16. Static analysis only. APK obtained from public APKPure source. No dynamic instrumentation performed. No credentials stored or tested. No security controls bypassed.*

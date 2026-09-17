# Mobile App Analysis — LPU Touch APK Reverse Engineering

**APK:** `LPU+Touch_23.45_APKPure.xapk`
**Package:** `ums.lovely.university`
**Version:** 23.45 (version code 234)
**Min SDK:** 22 (Android 5.1 Lollipop)
**Target SDK:** 36 (Android 16)
**Date Analyzed:** 2026-09-16
**Method:** Static analysis only — no dynamic instrumentation, no traffic interception

---

## CONFIRMED: Technology Stack

| Technology | Confidence | Evidence |
|-----------|------------|---------|
| **Ionic Framework** | HIGH | Ionicons SVG set in `assets/public/svg/` (1800+ SVG files) |
| **Angular** | HIGH | `NgModule`, `Component`, `Injectable`, `HttpClient`, `ActivatedRoute`, `Router`, `Observable` all present in JS bundle |
| **Apache Cordova** | HIGH | `org/apache/cordova/allowlist/` in APK; `cordova_plugins.js`; 18 Cordova plugin references |
| **Capacitor** | HIGH | `capacitor.config.json`, `capacitor.plugins.json`, `res/layout/capacitor_bridge_layout_main.xml` |
| **Angular + Ionic + Capacitor hybrid** | HIGH | All three confirmed simultaneously |
| **Kotlin** | HIGH | `kotlin/` directory, `DebugProbesKt.bin` in APK root |
| **Firebase** | HIGH | 12x Firebase property files: `firebase-messaging`, `firebase-installations`, `firebase-datatransport`, etc. |
| **Firebase Cloud Messaging (FCM)** | HIGH | `@capacitor-community/fcm` in `capacitor.plugins.json`; `firebase-messaging.properties` |

**This is NOT a WebView wrapper of UMS web pages. It is a FULL NATIVE Angular/Ionic app with its own API layer.**

---

## XAPK / APK Structure

```
LPU+Touch_23.45_APKPure.xapk (25MB total)
├── ums.lovely.university.apk  (24.7MB) — main app
├── config.en.apk              (40KB)   — English locale resources
├── config.mdpi.apk            (93KB)   — MDPI density resources
├── icon.png                   (193KB)  — launcher icon
└── manifest.json              — XAPK metadata

ums.lovely.university.apk (internal):
├── AndroidManifest.xml        (17KB binary)
├── classes.dex                (3.5MB) — Kotlin/Java bytecode
├── DebugProbesKt.bin          — Kotlin coroutines debug probes
├── assets/
│   ├── capacitor.config.json  — Capacitor configuration
│   ├── capacitor.plugins.json — Installed Capacitor plugins
│   ├── public/                — The Angular web app bundle
│   │   ├── index.html         — App shell
│   │   ├── main.[hash].js     — Complete Angular app bundle (minified)
│   │   ├── polyfills.[hash].js
│   │   ├── runtime.[hash].js
│   │   ├── styles.[hash].css
│   │   ├── cordova_plugins.js
│   │   ├── nunito-*.woff2     — Nunito font (app typography)
│   │   ├── svg/               — 1800+ Ionicons SVG files
│   │   └── plugins/           — Cordova plugin JS bridges
│   │       ├── cordova-plugin-advanced-http/
│   │       ├── cordova-plugin-buildinfo/
│   │       ├── cordova-plugin-camera/
│   │       ├── cordova-plugin-device/
│   │       ├── cordova-plugin-file/
│   │       ├── cordova-plugin-filechooser/
│   │       ├── mx.ferreyra.callnumber/
│   │       └── phonegap-plugin-barcodescanner/
│   ├── html-{lang}/           — Multi-language help pages (de/en/es/fr/it/ja/ko/nl/pt/ru/uk/zh)
│   └── dexopt/                — AOT compilation profiles
├── firebase-*.properties      — Firebase SDK components
├── res/
│   ├── layout/capacitor_bridge_layout_main.xml
│   └── xml/config.xml         — Cordova config
└── META-INF/                  — APK signing metadata
```

---

## Android Permissions (From XAPK manifest)

| Permission | Purpose |
|-----------|---------|
| `INTERNET` | Network access (core functionality) |
| `ACCESS_COARSE_LOCATION` | Campus location features |
| `ACCESS_FINE_LOCATION` | GPS-precise location |
| `READ_EXTERNAL_STORAGE` | File uploads (documents, photos) |
| `WRITE_EXTERNAL_STORAGE` | File downloads |
| `POST_NOTIFICATIONS` | Push notifications (FCM) |
| `CAMERA` | QR/barcode scanning, face inspection |
| `FLASHLIGHT` | Barcode scanner torch |
| `CALL_PHONE` | Direct call feature (`mx.ferreyra.callnumber`) |
| `VIBRATE` | Haptic feedback |
| `ACCESS_NETWORK_STATE` | Connectivity checks |
| `USE_BIOMETRIC` | Biometric login (fingerprint/face) |
| `USE_FINGERPRINT` | Fingerprint authentication (legacy) |
| `WAKE_LOCK` | Background processing |
| `RECEIVE` (FCM) | Push notification delivery |

---

## Capacitor Plugins Installed

| Plugin | Version/Package | Capability |
|--------|----------------|-----------|
| `@capacitor-community/fcm` | Firebase Cloud Messaging | Push notifications |
| `@capacitor/app` | App lifecycle | Background/foreground events |
| `@capacitor/camera` | Native camera | Photo capture |
| `@capacitor/device` | Device info | Platform detection |
| `@capacitor/filesystem` | File system | Download/upload |
| `@capacitor/geolocation` | GPS | Location services |
| `@capacitor/haptics` | Haptic feedback | Touch vibration |
| `@capacitor/keyboard` | Keyboard management | Input UX |
| `@capacitor/preferences` | Local storage | Persistent key-value store |
| `@capacitor/push-notifications` | Push notifications | FCM integration |
| `@capacitor/splash-screen` | Splash screen | App launch screen |
| `@capacitor/status-bar` | Status bar styling | UI customization |
| `capacitor-native-biometric` | Fingerprint/Face ID | Biometric login |

---

## Cordova Plugins Installed

| Plugin | Capability |
|--------|-----------|
| `cordova-plugin-advanced-http` | Native HTTP with cookie management (bypasses WebView CORS) |
| `cordova-plugin-buildinfo` | Build version info |
| `cordova-plugin-camera` | Camera access |
| `cordova-plugin-device` | Device information |
| `cordova-plugin-file` | File system operations |
| `cordova-plugin-filechooser` | File picker dialog |
| `mx.ferreyra.callnumber` | Direct phone call dialing |
| `phonegap-plugin-barcodescanner` | QR code / barcode scanner |

> [!IMPORTANT]
> The presence of `cordova-plugin-advanced-http` is highly significant. This plugin makes native HTTP requests (not through the WebView) and handles cookies natively. This explains how the app manages `ASP.NET_SessionId` cookies outside the browser context and bypasses CORS restrictions.

---

## CONFIRMED API ENDPOINTS (From JS Bundle)

### Primary Mobile API — `mobileapi.lpu.in`

This is a **dedicated mobile REST API** — separate from the web UMS. **This is the real integration point.**

| Endpoint | Method | Purpose |
|---------|--------|---------|
| `https://mobileapi.lpu.in/api` | Base URL | API root |
| `https://mobileapi.lpu.in/security/createToken` | POST | Create auth token |
| `https://mobileapi.lpu.in/security/createappToken` | POST | Create app-specific token |
| `https://mobileapi.lpu.in/security/createodlToken` | POST | Create ODL (distance learning) token |
| `https://mobileapi.lpu.in/security/Validate` | POST/GET | Validate existing token |
| `https://mobileapi.lpu.in/security/FP` | POST | Fingerprint/biometric auth |
| `https://mobileapi.lpu.in/api/Menu/UPS` | GET | App menu / user permission set |

### UMS Web Service — SOAP/REST hybrid

| Endpoint | Purpose |
|---------|---------|
| `https://ums.lpu.in/umswebservice/umswebservice.svc` | SOAP web service base |
| `https://ums.lpu.in/umswebservice/umswebservice.svc/PVR` | Visitor pass registration |

### OBP API (Staff-facing OBP portal)

| Endpoint | Purpose |
|---------|---------|
| `https://ums.lpu.in/obpapi/api/MeetingMinutes/GetPlannerSessionsMeetings` | Meeting planner |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/GetAllocationAllSelective` | Performance metrics |
| `https://ums.lpu.in/obpapi/api/MetricAllocation/GetAllocationAuthorityList` | Allocation authority |
| `https://ums.lpu.in/obpapi/api/OBPDashboard/GetOBPDashboardStaffAllocations` | Staff dashboard |
| `https://ums.lpu.in/obpapi/api/OBPDashboard/GetOBPDashboardStaffPercentage` | Staff metrics |

### WordPress Blog

| Endpoint | Purpose |
|---------|---------|
| `https://happenings.lpu.in/wp-json/wp/v2/posts` | LPU Happenings blog posts (WordPress REST API) |

---

## CONFIRMED App Routes (Angular Router)

The app has a full Angular router with the following student-facing routes (extracted from JS bundle):

### Academic / UMS Routes
```
attendance-rectification
academic-calender
AssignmentMarks
MarkStudentAttendance
NewCourseAttendence
OldAdmitCard
ReappearResult
SeatingPlan
ebooks
elective-polling
examination-tasks
```

### Financial Routes
```
fee-extention
fee-receipt
fee-statement
fee-status
fee-undertaking
fee-undertaking-form
```

### EduRev / GROW Routes
```
edu-revolution-apply-application
edu-revolution-categories
edu-revolution-consent
edu-revolution-courses
edu-revolution-custom-application
edu-revolution-gradeupgrade
edu-revolution-start
edu-revolution-track-progress
edu-revolution-track-view-details
```

### Health / Campus Services Routes
```
book-appointment
doctor-appointment
UnitHospital
fire-escape
```

### Administrative / RMS Routes
```
counsellor-rms
counsellor-rms-history
certificate-request
certificate-old-request-status
certificate-track-request-status
attendance-rectification
dpr
dpr-fill
SelfDevRecord
PDLTelephonic
```

### Campus / Profile Routes
```
campuse-tour
candidate-tabs
dl-qr-generate
face-inspection
announcement
announcement-details
events
```

### Games / Gamification Routes
```
game-dashboard
game-hos-dashboard
game-leadboard
game-coinsledger
game-parameters
game-points-detail
```

### Special Routes
```
ChangeUmsPassword
ResetInternetPassword
DocumentUpload
WebView
forgot-password
```

---

## Authentication Architecture (From JS Analysis)

Variables observed in the JS bundle related to authentication:

| Variable | Purpose |
|---------|---------|
| `NToken` | Mobile API auth token (from `createToken` endpoint) |
| `TOKEN` | Generic token storage |
| `TOUCH_ID` | Device-specific identifier |
| `DEVICE_ID` | Device identifier |
| `USER` | User object |
| `USER_ID` | Student/user identifier |
| `USER_TYPE` | User role (student/faculty/staff) |
| `PSW` | Password (NOT stored — passed during auth) |
| `PLAYER_ID` | OneSignal/FCM player ID for push |

**The app uses a TOKEN-based API** (`NToken`) from `mobileapi.lpu.in/security/createToken` — NOT the `ASP.NET_SessionId` cookie for the mobile API. The cookie-based auth is used separately for web-view portions.

---

## Third-Party SDKs

| SDK | Evidence | Purpose |
|-----|---------|---------|
| Firebase (core, messaging, installations, datatransport) | 12x property files | Core Firebase SDK |
| Firebase Cloud Messaging | `firebase-messaging.properties`, FCM plugin | Push notifications |
| Google Play Services (location, tasks, basement, base) | Property files | Location + Google services |
| Sentry | Referenced in JS bundle | Error tracking / crash reporting |
| Kotlin Coroutines | `DebugProbesKt.bin` | Async operations in Kotlin layer |

---

## Key Architectural Insights

### 1. NOT a WebView Wrapper
This app is a fully featured Ionic/Angular application, not a simple WebView wrapping UMS web pages. It has its own:
- Route structure (50+ routes)
- Service layer
- API integration
- Local storage
- Native plugins

### 2. mobileapi.lpu.in is the Real Integration API
The app communicates with `mobileapi.lpu.in` — a dedicated mobile REST API separate from the web UMS. This API:
- Uses token-based authentication (`NToken`)
- Returns JSON (not HTML)
- Is purpose-built for mobile clients

### 3. EduRev / GROW is Already in the App
The route names `edu-revolution-*` confirm that LPU's EduRev program is already integrated into LPU Touch. This validates our Paladeium EduRev Connect module as highly relevant.

### 4. Gamification Already Exists in LPU Touch
Routes: `game-dashboard`, `game-leadboard`, `game-coinsledger`, `game-points-detail` confirm LPU already has a gamification system in the app. Paladeium's quest/achievement system must be clearly differentiated.

### 5. Biometric Login
Fingerprint + Face ID are supported via `capacitor-native-biometric`. Security-conscious app.

### 6. QR/Barcode Scanner
Present (`phonegap-plugin-barcodescanner`) — used for attendance, campus access, etc.

### 7. Font: Nunito
The app uses the Nunito font family (not Poppins as seen on the web portal). The bundled web app serves its own font stack.

---

## Integration Implications for Paladeium

| Finding | Paladeium Implication |
|---------|----------------------|
| `mobileapi.lpu.in` is a real JSON API | **Primary integration target** — much better than HTML scraping |
| Token auth via `/security/createToken` | Our backend should POST credentials → receive token → use for subsequent calls |
| `/api/Menu/UPS` returns user permission set | First call after auth — reveals available features for user type |
| EduRev routes exist in LPU Touch | Validate our EduRev data model against LPU's own implementation |
| Gamification exists in LPU Touch | Paladeium's quest layer must be clearly differentiated (map-based discovery vs. generic points) |
| WordPress REST API for happenings | EventHub could consume `happenings.lpu.in/wp-json/wp/v2/posts` directly |
| Geolocation plugin present | GPS is used by LPU Touch — location features are expected by students |
| Sentry for error tracking | LPU Touch is production-quality; our integration must match reliability expectations |

---

## Critical Security Note

No API keys, tokens, Firebase project IDs, or credentials were extracted from this APK and documented here. Any such values found during analysis were not recorded. The analysis focused exclusively on API architecture, endpoint structure, and technology identification.

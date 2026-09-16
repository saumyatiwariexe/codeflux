# Architecture — LPU UMS System Architecture

**Status:** Reconstructed from passive observation and public documentation.
Components are marked: [CONFIRMED], [LIKELY], [INFERRED], [UNKNOWN]

---

## System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        LPU DIGITAL ECOSYSTEM                               ║
║                     Domain: *.lpu.in (Wildcard TLS)                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
                                    │
                              HTTPS only
                           (HSTS enforced)
                                    │
                    ┌───────────────▼───────────────┐
                    │        Cloudflare CDN/DNS      │ [CONFIRMED]
                    │   NS: jihoon + wren .cf.com    │
                    │   DDoS Protection + Proxy      │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │    Microsoft IIS 10.0          │ [CONFIRMED]
                    │    Windows Server              │ [CONFIRMED]
                    │    IP: 172.19.2.250 (origin)   │ [CONFIRMED]
                    └──────────────┬────────────────┘
                                   │
              ASP.NET Runtime (x-powered-by: ASP.NET)    [CONFIRMED]
                                   │
         ┌─────────────────────────┼──────────────────────────┐
         │                         │                          │
         ▼                         ▼                          ▼
 ┌──────────────┐        ┌─────────────────┐       ┌──────────────────┐
 │ /lpuums/     │        │   /econnect/    │       │   /myclass/      │
 │ Main UMS     │        │ Distance Edu    │       │ Learning Mgmt    │
 │ [CONFIRMED]  │        │ [CONFIRMED]     │       │ [CONFIRMED]      │
 └──────┬───────┘        └────────┬────────┘       └────────┬─────────┘
        │                         │                          │
        │              ┌──────────▼──────────┐               │
        │              │    /induction/      │               │
        │              │  Freshmen Portal    │               │
        │              │  [CONFIRMED]        │               │
        │              └─────────────────────┘               │
        │                                                     │
        └────────────────────────┬────────────────────────────┘
                                 │
                    ASP.NET WebForms Engine           [CONFIRMED]
                    (.aspx pages, server controls)
                                 │
                ┌────────────────┼──────────────────────┐
                │                │                      │
                ▼                ▼                      ▼
        ┌──────────────┐ ┌─────────────┐     ┌──────────────────┐
        │   /mobile/   │ │  Auth Layer │     │  Business Logic  │
        │  .aspx views │ │  Session    │     │  (Attendance,    │
        │  (mobile UI) │ │  ASP.NET_   │     │   Grades,        │
        │  [CONFIRMED] │ │  SessionId  │     │   Timetable,     │
        └──────────────┘ │ [CONFIRMED] │     │   Announcements) │
                         └──────┬──────┘     │  [INFERRED]      │
                                │            └────────┬─────────┘
                                │                     │
                                └─────────┬───────────┘
                                          │
                                          ▼
                             ┌────────────────────────┐
                             │  Microsoft SQL Server  │ [LIKELY]
                             │  (Primary Database)    │
                             │                        │
                             │  Tables (inferred):    │
                             │  - Students            │
                             │  - Attendance          │
                             │  - Timetable           │
                             │  - Courses             │
                             │  - Marks/Grades        │
                             │  - Announcements       │
                             │  - Faculty             │
                             │  - Enrollment          │
                             └────────────────────────┘


════════════════════ SEPARATE SERVICES ══════════════════════

 ┌─────────────────────────────────────────────────────────┐
 │                   lpulive.lpu.in                        │
 │              LPU Live (Chat Platform)                   │
 │         "Developed by students" — more modern           │
 │         Token-based auth (en_user_id token)  [LIKELY]  │
 │         JSON API responses                   [LIKELY]  │
 │         Real-time messaging (WebSocket?)     [INFERRED]│
 └─────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────┐
 │                    oas.lpu.in                           │
 │         Online Assessment System (OAS)                  │
 │         Exam delivery platform              [CONFIRMED] │
 │         Likely same IIS/ASP.NET stack       [INFERRED]  │
 └─────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────┐
 │                    oms.lpu.in                           │
 │         Office Management System                        │
 │         Appointment scheduling             [CONFIRMED]  │
 └─────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────┐
 │                 dashboards.lpu.in                       │
 │         Business Intelligence / Reporting               │
 │         Likely Power BI / SSRS              [INFERRED]  │
 └─────────────────────────────────────────────────────────┘


════════════════════ MOBILE CLIENT ══════════════════════════

 ┌─────────────────────────────────────────────────────────┐
 │              LPU Touch Mobile App                       │
 │         Package: ums.lovely.university      [CONFIRMED] │
 │         Platform: Android + iOS             [CONFIRMED] │
 │         Architecture: Hybrid WebView        [LIKELY]    │
 │         Framework: Ionic + Cordova/Cap      [LIKELY]    │
 │                                                         │
 │         Loads: ums.lpu.in/mobile/*.aspx pages           │
 │         Auth:  ASP.NET_SessionId cookie     [LIKELY]    │
 └─────────────────────────────────────────────────────────┘


════════════════ MICROSOFT 365 INTEGRATION ══════════════════

 ┌─────────────────────────────────────────────────────────┐
 │         Microsoft 365 / Exchange Online                 │
 │         MX: lpu-in.mail.protection.outlook.com         │
 │         Email domain: @lpu.in               [CONFIRMED] │
 └─────────────────────────────────────────────────────────┘
```

---

## Data Flow: Student Login (Observed + Inferred)

```
Student Browser / LPU Touch
        │
        │  POST credentials (reg_no + password)
        ▼
   Cloudflare Proxy
        │
        ▼
   IIS 10.0 / ASP.NET WebForms Login Page
        │
        │  Validate against DB
        ▼
   SQL Server (credentials table)
        │
        │  Auth success
        ▼
   ASP.NET Session Manager
        │
        │  Create session token
        ▼
   Set-Cookie: ASP.NET_SessionId=[token]; HttpOnly; SameSite=Lax
        │
        ▼
   Student accesses: /lpuums/dashboard
   (subsequent requests carry session cookie)
        │
        ▼
   ASP.NET page renders HTML from DB data
   (server-side rendering, ViewState included)
        │
        ▼
   HTML returned to browser/WebView
```

---

## Key Architectural Observations

### What Makes This a WebForms System

1. `.aspx` file extensions in URLs
2. `frm` naming prefix (WebForms convention for Form pages)
3. Session cookie is the only observable auth mechanism (no JWT/bearer)
4. Community scrapers use BeautifulSoup to parse returned HTML — confirms server-rendered HTML responses
5. No evidence of a modern SPA (React/Angular/Vue) framework

### What This Means for Integration

- **No REST API contract** — the "API" is the rendered HTML page
- **Session-based auth only** — no OAuth2 flow to integrate with
- **CORS blocks browser-side calls** — `access-control-allow-origin: https://*.lpu.in` prevents external browser apps
- **Mobile app uses same web pages** — LPU Touch is a WebView wrapper, not a native app with a separate API

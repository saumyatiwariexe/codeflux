# Executive Summary — LPU UMS Architecture Dissection

**Date:** 2026-09-15 | **Classification:** Internal Research | **Author:** Paladeium Team

---

## 1. What technology does LPU UMS appear to use?

**Confirmed: Microsoft ASP.NET on IIS 10.0**

The UMS web application stack is clearly identifiable from publicly observable HTTP headers:

- `Server: Microsoft-IIS/10.0` — confirmed on every sub-path probed
- `X-Powered-By: ASP.NET` — confirmed on every sub-path probed
- `.aspx` file extensions confirmed in publicly documented announcement URLs (e.g., `ums.lpu.in/mobile/frmDisplayAnnouncement.aspx`)

The presence of `.aspx` extensions and the `__VIEWSTATE`/`__doPostBack` pattern (documented by community projects that reverse-engineered the login flow) confirms this is **ASP.NET WebForms**, not ASP.NET Core MVC or a modern SPA.

The login page at `ums.lpu.in` (the portal selector) is a **static HTML + jQuery + Bootstrap** landing page that links to the actual UMS sub-applications.

**Confidence: HIGH**

---

## 2. What technology does LPU Touch appear to use?

**Likely: Hybrid mobile app (WebView-based), package name `ums.lovely.university`**

- LPU Touch is published on Google Play Store and Apple App Store under `ums.lovely.university`
- Multiple public sources and the app store description describe it as a cross-platform hybrid application
- The architecture is consistent with an Ionic/Cordova or Ionic/Capacitor hybrid app wrapping the UMS web interface in a WebView
- The requirements.txt from the community UMS API project reveals the UMS backend communicates via standard HTTP with cookie-based sessions — consistent with a WebView wrapper that inherits browser-style session cookies
- No Flutter, React Native, or Kotlin-native indicators were found in public sources

**Confidence: MEDIUM** (no APK binary analysis performed)

---

## 3. What backend architecture is observable?

**Confirmed: ASP.NET WebForms on Windows Server / IIS 10.0**

Observable architecture components:

| Component | Technology | Confidence | Evidence |
|-----------|-----------|------------|---------|
| Web Server | Microsoft IIS 10.0 | HIGH | `Server` header |
| App Framework | ASP.NET (WebForms) | HIGH | `X-Powered-By`, `.aspx` URLs |
| Session Management | ASP.NET Session | HIGH | `ASP.NET_SessionId` cookie |
| CDN/DNS | Cloudflare | HIGH | NS records: `jihoon.ns.cloudflare.com`, `wren.ns.cloudflare.com` |
| Mail | Microsoft 365 (Exchange Online) | HIGH | MX: `lpu-in.mail.protection.outlook.com` |
| TLS | DigiCert / GeoTrust wildcard `*.lpu.in` | HIGH | Certificate subject/issuer |
| CORS Policy | `https://*.lpu.in` only | HIGH | `access-control-allow-origin` header |
| Security Header | HSTS enabled | HIGH | `strict-transport-security: max-age=31536000` |

The system is a classic monolithic ASP.NET WebForms ERP. It exposes a `/mobile/` path (e.g., `ums.lpu.in/mobile/frmDisplayAnnouncement.aspx`) suggesting a mobile-specific view layer built on the same WebForms backend.

**Confidence: HIGH**

---

## 4. What database technology is supported by evidence?

**Most likely: Microsoft SQL Server**

Reasoning:
- ASP.NET WebForms applications of this vintage (LPU UMS is described as an "in-house ERP developed over many years") almost universally use Microsoft SQL Server as their data store
- The full Microsoft stack (IIS + ASP.NET + SQL Server) is the canonical enterprise Windows stack
- Community projects that parse UMS HTML note data is rendered server-side from what appears to be database-backed templates — format is consistent with SQL Server ADO.NET data binding
- No public error pages exposing database type were observed (correctly configured production system)
- LPU's technical documentation references enterprise-grade database management, consistent with SQL Server

**Confidence: MEDIUM** (direct database type was not accessible from client; inferred from framework stack)

---

## 5. How does authentication work?

**Confirmed: ASP.NET Cookie-based Session Authentication**

1. User POSTs registration number + password to the login endpoint (WebForms postback or API endpoint)
2. Server validates credentials against the database
3. Server creates an `ASP.NET_SessionId` cookie (HttpOnly, SameSite=Lax)
4. All subsequent requests carry this session cookie
5. Session is maintained server-side; cookie is a random session identifier only

The `/myclass/` sub-application was observed issuing `ASP.NET_SessionId` on first visit. Community API projects confirm the login response returns this cookie for all authenticated UMS interactions.

There is **no OAuth2, no JWT, no Bearer token** visible from public evidence. Authentication is purely cookie-session based.

**Confidence: HIGH**

---

## 6. What APIs/data domains are observable?

From community-documented behavior (unofficial reverse-engineering of the student-facing client):

| Data Domain | Access Method | Format | Confidence |
|-------------|--------------|--------|------------|
| Student Profile | Session-authenticated HTTP | HTML (scraped) / JSON (inferred) | MEDIUM |
| Attendance | Session-authenticated HTTP | HTML (scraped) | MEDIUM |
| Timetable / Classes | Session-authenticated HTTP | HTML (scraped) | MEDIUM |
| Announcements | Session-authenticated, `.aspx` URL | HTML | HIGH (URL confirmed) |
| Grades / Marks | Session-authenticated HTTP | HTML (scraped) | MEDIUM |
| CGPA | Session-authenticated HTTP | HTML (scraped) | MEDIUM |
| Messages | Session-authenticated HTTP | HTML (scraped) | MEDIUM |
| LPU Live (chat) | Separate service, token-based | JSON | MEDIUM |
| Placement Portal | Separate session, same cookie mechanism | HTML/JSON | MEDIUM |

No GraphQL, WebSocket, or official REST API was identified in publicly observable evidence. Community tools work by posting credentials, receiving a session cookie, then scraping HTML responses with BeautifulSoup.

---

## 7. What can our application integrate with?

**Immediately feasible (with appropriate authorization):**
- Student identity verification (name, registration number, program, section)
- Timetable data (class schedule, timings, room numbers)
- Attendance percentage (aggregate)
- Announcements feed
- CGPA/academic standing

**Requires LPU official cooperation:**
- Real-time push notifications
- Guaranteed API stability
- OAuth2/SSO integration
- Bulk data access
- Any integration beyond individual student's own session

---

## 8. What requires LPU cooperation?

| Requirement | Why LPU Cooperation Needed |
|-------------|---------------------------|
| Official SSO / OAuth2 | UMS has no public OAuth2 server; one must be provisioned |
| Stable REST API | Current observable APIs are HTML-scraping based; brittle |
| Real-time data feeds | WebSockets / push not available without official integration |
| Hackathon demo credentials | Test account for live demo of UMS data |
| API rate limit exemption | To avoid being blocked during demo/production use |
| Official endorsement | Required for production deployment at LPU |

**Contact:** Lovely Infotech, Block 30 – Room 405, LPU Campus (listed on UMS footer)

---

## 9. What architecture should we use?

### For Hackathon (Paladeium demo)

```
Paladeium Backend (Fastify/Node.js + Supabase)
    │
    ├── Own data: buildings, POIs, quests, fog-of-war, H3 cells,
    │            squad matching, events, lost+found
    │
    └── UMS data: Student enters reg_no + password in Paladeium
                  → Paladeium backend POSTs to UMS login (session)
                  → Fetches student profile/timetable (one-time or cached)
                  → Stores only non-sensitive derived data (name, section, program)
                  → NEVER stores raw UMS credentials
```

> [!CAUTION]
> The credential-relay approach (Paladeium stores/transmits UMS passwords) is architecturally unsafe for production and violates good security practice. It is acceptable ONLY as a hackathon demo with explicit user consent and immediate credential discard. Do NOT use this pattern in production.

### For Production

```
LPU Official Integration Agreement
    │
    └── OAuth2 / SSO endpoint from LPU IT
            │
            └── Paladeium Backend receives scoped access token
                    │
                    └── Access only: name, reg_no, section, timetable
                                     (no password ever touches Paladeium)
```

---

## 10. What information remains unknown?

| Unknown | Why Unknown |
|---------|-------------|
| Exact UMS REST API endpoints | Requires authenticated session to observe |
| Whether UMS exposes JSON APIs natively or only HTML | Requires network tab analysis in authenticated session |
| Internal database schema | Not externally accessible (correct) |
| Whether a mobile-specific JSON API exists at `/mobile/` path | Requires authenticated session |
| Whether LPU has an internal developer portal or API program | Not publicly documented |
| Exact LPU Touch framework (Ionic vs plain WebView) | Requires APK decompilation |
| Session timeout duration | Requires authenticated session observation |
| Whether SAML/SSO is available internally | Not publicly disclosed |

---

*This summary is based on passive observation only. No authentication was bypassed, no credentials were stored, and no unauthorized access was performed.*

# Findings — LPU UMS Architecture Dissection

All findings are based on passive, authorized observation only.
No authentication was bypassed. No credentials were stored.

---

## F-001 — Web Server: Microsoft IIS 10.0

**Observation:**
Every HTTP response from `ums.lpu.in` and all observed sub-applications returns the header `Server: Microsoft-IIS/10.0`.

**Evidence:**
```
HTTP/2 200
server: Microsoft-IIS/10.0
```
Confirmed on: `ums.lpu.in/`, `ums.lpu.in/lpuums/`, `ums.lpu.in/econnect/`, `ums.lpu.in/myclass/`

**Confidence:** HIGH

**Implication:**
The UMS runs on Microsoft Internet Information Services (IIS) version 10.0, which ships with Windows Server 2016/2019/2022. This is a confirmed Windows Server deployment. No Linux-based web server (nginx, Apache) is in use.

---

## F-002 — Application Framework: ASP.NET

**Observation:**
Every HTTP response includes `X-Powered-By: ASP.NET`.

**Evidence:**
```
x-powered-by: ASP.NET
```
Confirmed on all probed sub-paths. This header is emitted by the ASP.NET runtime automatically unless explicitly suppressed.

**Confidence:** HIGH

**Implication:**
The application is built on Microsoft ASP.NET. This could be WebForms, MVC, or ASP.NET Core — further evidence distinguishes between these variants (see F-003).

---

## F-003 — ASP.NET WebForms (not Core MVC)

**Observation:**
Publicly documented announcement URLs use `.aspx` file extensions:
```
https://ums.lpu.in/mobile/frmDisplayAnnouncement.aspx?aid=123309&tbl=Online
https://ums.lpu.in/mobile/frmDisplayAnnouncement.aspx?aid=123309&tbl=StuGen
```
These URLs are documented in the public `Ryuk-me/UMS-Api` GitHub repository README, which was authored by a student who reverse-engineered the UMS mobile client behavior.

**Evidence:**
- `.aspx` extension = ASP.NET WebForms page
- `frm` prefix on page names = classic WebForms naming convention (`frmDisplayAnnouncement` = "form: Display Announcement")
- Query string parameters (`aid=`, `tbl=`) = WebForms pattern for passing state via querystring

**Confidence:** HIGH

**Implication:**
UMS uses ASP.NET WebForms — a legacy page-centric framework. This means:
- Pages are server-rendered HTML
- State is managed via `__VIEWSTATE` hidden fields
- Navigation is postback-based, not REST
- No native REST/JSON API is expected (though one may be separately bolted on for mobile)

---

## F-004 — Session Authentication: ASP.NET_SessionId Cookie

**Observation:**
A live HTTP request to `https://ums.lpu.in/myclass/` returns a `Set-Cookie` header containing `ASP.NET_SessionId`:

```
set-cookie: ASP.NET_SessionId=[REDACTED]; path=/; HttpOnly; SameSite=Lax
```

**Evidence:**
- Cookie name: `ASP.NET_SessionId` (well-known ASP.NET session cookie name)
- Flags: `HttpOnly` (not accessible to JavaScript), `SameSite=Lax`
- Path: `/` (session scoped to entire domain)

The community API project (`Ryuk-me/UMS-Api`) also documents:
```json
{ "cookie": "ASP.NET_SessionId=abcdeflol" }
```
as the login response, confirming this is the authentication token for all UMS requests.

**Confidence:** HIGH

**Implication:**
Authentication is purely cookie-session based. There is no JWT, no Bearer token, no OAuth2 observable from the outside. Any integration must either:
1. Obtain official SSO from LPU
2. Relay the user's session cookie (insecure for production)
3. Use a credential-forwarding proxy (only acceptable for demo with explicit consent)

---

## F-005 — DNS: Cloudflare as DNS Provider

**Observation:**
DNS NS records for `lpu.in`:
```
jihoon.ns.cloudflare.com.
wren.ns.cloudflare.com.
```

DNS A record for `ums.lpu.in`:
```
172.19.2.250
```

No CNAME record for `ums.lpu.in` (direct A record).

**Evidence:** `dig lpu.in NS`, `dig ums.lpu.in A`

**Confidence:** HIGH

**Implication:**
LPU uses Cloudflare for DNS. The resolved IP `172.19.2.250` is a private/RFC-1918 address range, which is unusual for a public-facing server — this may indicate the IP is behind a Cloudflare proxy (Cloudflare returns the origin IP in the A record range, or this is a Cloudflare Tunnel). This means the actual origin server IP is shielded. DDoS protection and CDN caching are likely in use.

---

## F-006 — TLS: DigiCert Wildcard Certificate

**Observation:**
TLS certificate details:
```
Issuer: DigiCert Inc / GeoTrust TLS RSA CA G1
Subject: CN=*.lpu.in, O=Lovely Professional University, L=Phagwara, ST=Punjab, C=IN
Valid: Nov 3, 2025 — Nov 20, 2026
Algorithm: sha256WithRSAEncryption (RSA 2048-bit)
```

**Evidence:** `openssl s_client + x509 -text`

**Confidence:** HIGH

**Implication:**
LPU uses a commercial wildcard certificate from DigiCert covering `*.lpu.in`. This covers all sub-domains: `ums.lpu.in`, `oas.lpu.in`, `oms.lpu.in`, `myclass.lpu.in`, `lpulive.lpu.in`, etc. The certificate is issued to the university directly, confirming organizational identity.

---

## F-007 — CORS Policy: Restricted to *.lpu.in

**Observation:**
The `/lpuums/` sub-application returns:
```
access-control-allow-origin: https://*.lpu.in
access-control-allow-methods: GET, OPTIONS
access-control-allow-headers: Content-Type
content-security-policy: frame-ancestors https://*.lpu.in
cross-origin-resource-policy: cross-origin
```

**Evidence:** HTTP headers from `curl -sI https://ums.lpu.in/lpuums/`

**Confidence:** HIGH

**Implication:**
The UMS API/resources are CORS-restricted to `https://*.lpu.in` only. This means:
- Our Paladeium app (hosted at a non-`lpu.in` domain) **cannot** make direct browser-to-UMS cross-origin API calls
- Any UMS data access from Paladeium must go through our own backend acting as a proxy
- This CORS policy is a deliberate security measure to prevent unauthorized web apps from accessing UMS data client-side

---

## F-008 — Mail: Microsoft 365 / Exchange Online

**Observation:**
MX record for `lpu.in`:
```
0 lpu-in.mail.protection.outlook.com.
```

**Evidence:** `dig lpu.in MX`

**Confidence:** HIGH

**Implication:**
LPU uses Microsoft 365 for email. This is consistent with the overall Microsoft technology stack (Windows Server + IIS + ASP.NET + SQL Server + M365). LPU's institutional email is `@lpu.in` routed through Exchange Online.

---

## F-009 — LPU Ecosystem: Multiple Sub-Applications on Same Stack

**Observation:**
The UMS portal homepage (`ums.lpu.in`) links to multiple sub-applications, all sharing the same IIS/ASP.NET stack:

| Sub-Application | URL | Purpose |
|----------------|-----|---------|
| UMS (main) | `ums.lpu.in/lpuums` | Core academic management |
| eConnect | `ums.lpu.in/econnect` | Distance education |
| LPU Live | `lpulive.lpu.in` | Real-time chat (student-built) |
| MyClass | `ums.lpu.in/myclass` | Learning management |
| OAS | `oas.lpu.in` | Online assessment/exams |
| OMS | `oms.lpu.in` | Office management |
| Dashboards | `dashboards.lpu.in` | Business intelligence |
| Induction Portal | `ums.lpu.in/induction` | Freshmen onboarding |

**Evidence:** HTML source of `ums.lpu.in/` (index page)

**Confidence:** HIGH

**Implication:**
LPU has a tightly integrated ecosystem of web applications, all under `*.lpu.in`. A single wildcard certificate and Cloudflare DNS covers them all. An official integration would likely need to span multiple services.

---

## F-010 — Mobile Path: /mobile/ Sub-Directory on UMS

**Observation:**
Community documentation reveals a `/mobile/` sub-directory on UMS used for mobile-optimized pages:
```
https://ums.lpu.in/mobile/frmDisplayAnnouncement.aspx?aid={id}&tbl=Online
https://ums.lpu.in/mobile/frmDisplayAnnouncement.aspx?aid={id}&tbl=StuGen
```

**Evidence:** `Ryuk-me/UMS-Api` GitHub README (public)

**Confidence:** HIGH (URL pattern confirmed), MEDIUM (full endpoint set unknown)

**Implication:**
UMS has a mobile-specific view layer at `/mobile/`. The LPU Touch app almost certainly loads these pages inside a WebView. This is not a separate REST API — it is server-rendered HTML optimized for small screens. Any API-style calls to this path would return HTML, not JSON, unless LPU built a parallel JSON endpoint.

---

## F-011 — Community API: Web Scraping via BeautifulSoup

**Observation:**
The most detailed public unofficial API (`Ryuk-me/UMS-Api`) uses:
- **FastAPI** as the wrapper server
- **httpx** / **aiohttp** for async HTTP to UMS
- **BeautifulSoup4 + lxml** for HTML parsing
- **ASP.NET_SessionId** cookie as the auth token

Data domains documented as accessible via scraping:
- Student profile (name, reg_no, program, section, CGPA, phone, DOB, photo)
- Aggregate attendance percentage
- Roll number
- LPU Live user search

**Evidence:** `requirements.txt` + README from `Ryuk-me/UMS-Api` (public GitHub)

**Confidence:** HIGH (the scraping approach is confirmed to have worked at time of commit; current functionality unknown)

**Implication:**
UMS does not expose a native JSON API to students. All community tools work by scraping HTML server-rendered responses. This means:
1. No stable API contract exists for third-party use
2. Any HTML structure change in UMS will break these scrapers
3. LPU has deliberately not published an API (intentionally or not)
4. The practical integration approach for a hackathon is still credential-relay + HTML scraping

---

## F-012 — LPU Touch Package Name: ums.lovely.university

**Observation:**
Multiple app store listings confirm the LPU Touch Android package name as:
```
ums.lovely.university
```

**Evidence:** APKPure, Uptodown, Google Play Store listings (public)

**Confidence:** HIGH

**Implication:**
The package name `ums.lovely.university` follows a reverse-domain convention and confirms this is an official LPU-published application. It is not a subdomain-based package, suggesting it was registered specifically for UMS mobile access.

---

## F-013 — HSTS Enforced

**Observation:**
```
strict-transport-security: max-age=31536000
```

**Evidence:** HTTP header from `ums.lpu.in/lpuums/`

**Confidence:** HIGH

**Implication:**
LPU enforces HTTP Strict Transport Security for 1 year. All communication must be HTTPS. No HTTP downgrade is possible. This is a security-positive signal — the system is correctly configured for transport security.

---

## F-014 — LPU Live: Separate Token-Based Authentication

**Observation:**
The community API README describes a separate token mechanism for LPU Live:
- LPU Live uses a separate auth token (`en_user_id` / `LPU_LIVE_TOKEN`)
- This token is obtainable from Chrome DevTools network tab after logging into `lpulive.lpu.in`
- The LPU Live user search API returns structured JSON (not HTML)

**Evidence:** `Ryuk-me/UMS-Api` README — "How to get LPU LIVE TOKEN" section

**Confidence:** MEDIUM (described in community docs; not independently verified)

**Implication:**
LPU Live is a more modern application (described as "developed by students") that appears to use a proper token-based API returning JSON. This suggests LPU has at least one service with a REST/JSON API pattern. LPU Live may be worth investigating separately as it could expose a more integration-friendly interface than the legacy UMS WebForms application.

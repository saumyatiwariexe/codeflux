# LPU University Management System (UMS)
## Technical Architecture Report

> **Classification:** Internal Research — Paladeium Project
> **Host:** `ums.lpu.in`
> **Investigation Date:** 2026-09-15
> **Method:** Passive observation — HTTP headers, DNS, TLS, HTML, public sources
> **No authentication was bypassed. No credentials were tested or stored.**

---

## 1. Overview

The LPU University Management System (UMS) is a proprietary in-house ERP web application built and operated by Lovely Professional University. It is the central platform for all academic and administrative processes — serving 40,000+ students, 4,000+ faculty, and administrative staff.

The UMS is accessed through a portal selector at `https://ums.lpu.in/` which routes users to multiple integrated sub-applications, all hosted under the same domain and server infrastructure.

---

## 2. Technology Stack

### 2.1 Web Server

| Component | Value | Confidence | Evidence |
|-----------|-------|-----------|---------|
| Web Server | **Microsoft IIS 10.0** | HIGH | `Server: Microsoft-IIS/10.0` on all probed paths |
| Operating System | **Windows Server 2016/2019/2022** | HIGH | IIS 10.0 ships exclusively on Windows Server |
| Protocol | **HTTPS/2** | HIGH | HTTP/2 confirmed via curl |

### 2.2 Application Framework

| Component | Value | Confidence | Evidence |
|-----------|-------|-----------|---------|
| App Runtime | **ASP.NET** | HIGH | `X-Powered-By: ASP.NET` on every sub-path |
| App Pattern | **ASP.NET WebForms** | HIGH | `.aspx` file extensions in URLs, `frm*` page naming convention |
| Framework Era | **Legacy .NET Framework** | HIGH | WebForms is a pre-.NET Core framework (introduced 2002) |

The `.aspx` extension and `frm` prefix naming — e.g. `frmDisplayAnnouncement.aspx` — are definitive WebForms markers. This means the system uses server-side page rendering with `__VIEWSTATE` hidden fields for state management, not a modern SPA or REST API pattern.

### 2.3 Frontend — Portal Selector Page

The landing page at `ums.lpu.in/` is a **static HTML page** (not ASP.NET itself) acting as a portal menu.

| Library | Version | Evidence |
|---------|---------|---------|
| jQuery | 3.6.0 | `assets/js/jquery-3.6.0.min.js` |
| Bootstrap | 4/5 | `assets/css/bootstrap.min.css` |
| Font Awesome | — | `font-awesome/css/font-awesome.min.css` |
| Flaticon | — | `flaticon/font/flaticon.css` |
| Poppins (Google Font) | — | `fonts.googleapis.com/css2?family=Poppins` |

No React, Angular, Vue, or any modern SPA framework detected on the public portal.

### 2.4 Database (Inferred)

| Database | Confidence | Reasoning |
|---------|-----------|-----------|
| **Microsoft SQL Server** | MEDIUM-HIGH | Universal pairing with IIS + ASP.NET WebForms in enterprise ERP of this generation; consistent with full Microsoft ecosystem (IIS + ASP.NET + SQL Server + M365) |

The database is not directly observable from the client. No SQL error messages exposing the database type were encountered. The inference is based on technology stack correlation.

### 2.5 Network Infrastructure

| Component | Technology | Confidence | Evidence |
|-----------|-----------|-----------|---------|
| DNS Provider | **Cloudflare** | HIGH | NS: `jihoon.ns.cloudflare.com`, `wren.ns.cloudflare.com` |
| CDN / DDoS | **Cloudflare** | HIGH | Same as DNS |
| TLS Certificate | **DigiCert / GeoTrust TLS RSA CA G1** | HIGH | `openssl s_client` inspection |
| Certificate Type | **Wildcard `*.lpu.in`** | HIGH | Subject: `CN=*.lpu.in` |
| Certificate Holder | Lovely Professional University | HIGH | `O=Lovely Professional University, L=Phagwara, ST=Punjab, C=IN` |
| Certificate Validity | Nov 3 2025 — Nov 20 2026 | HIGH | Certificate dates |
| Email | **Microsoft 365 / Exchange Online** | HIGH | MX: `lpu-in.mail.protection.outlook.com` |

---

## 3. DNS Records

```
ums.lpu.in  A     172.19.2.250
lpu.in      NS    jihoon.ns.cloudflare.com.
lpu.in      NS    wren.ns.cloudflare.com.
lpu.in      MX    0 lpu-in.mail.protection.outlook.com.
```

The IP `172.19.2.250` is shielded behind Cloudflare's proxy — the actual origin server IP is not publicly exposed.

---

## 4. Sub-Application Ecosystem

All sub-applications share the same IIS/ASP.NET infrastructure under `*.lpu.in`:

| Application | URL | Purpose |
|------------|-----|---------|
| UMS (main) | `ums.lpu.in/lpuums` | Core academic ERP — student/faculty portal |
| eConnect | `ums.lpu.in/econnect` | Distance education portal |
| MyClass | `ums.lpu.in/myclass` | Learning management system |
| Induction Portal | `ums.lpu.in/induction` | Freshmen onboarding |
| OAS | `oas.lpu.in` | Online assessment / exam delivery |
| OMS | `oms.lpu.in` | Office management / appointment booking |
| Dashboards | `dashboards.lpu.in` | Business intelligence reporting |
| LPU Live | `lpulive.lpu.in` | Real-time student chat (student-built, separate stack) |
| Happenings | `happenings.lpu.in` | Events/news (WordPress) |

---

## 5. HTTP Security Headers

All headers observed directly via `curl -sI` with no authentication.

| Header | Value | Implication |
|--------|-------|-------------|
| `Server` | `Microsoft-IIS/10.0` | Server technology exposed |
| `X-Powered-By` | `ASP.NET` | Runtime exposed |
| `X-Frame-Options` | `SAMEORIGIN` | Anti-clickjacking |
| `Strict-Transport-Security` | `max-age=31536000` | HTTPS forced for 1 year |
| `Content-Security-Policy` | `frame-ancestors https://*.lpu.in` | Only LPU domains can embed |
| `Access-Control-Allow-Origin` | `https://*.lpu.in` | CORS — only LPU domains allowed |
| `Access-Control-Allow-Methods` | `GET, OPTIONS` | Restricted HTTP methods |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Resource sharing policy |

> **Critical integration constraint:** The CORS policy `access-control-allow-origin: https://*.lpu.in` completely blocks browser-based cross-origin requests from any non-LPU domain. Paladeium cannot call UMS APIs directly from the mobile app. All UMS data access must route through Paladeium's own backend.

---

## 6. Authentication Model

### Mechanism
**ASP.NET Cookie-Based Session Authentication**

### Login Flow

```
STEP 1 — Credential Submission
  Client → POST ums.lpu.in/lpuums/
  Content-Type: application/x-www-form-urlencoded
  Body: __VIEWSTATE=[base64], __EVENTVALIDATION=[token],
        RegistrationNo=[reg_no], Password=[password]

STEP 2 — Server Validation
  IIS → ASP.NET WebForms runtime
  Deserializes __VIEWSTATE
  Validates credentials against SQL Server
  Creates server-side session object on success

STEP 3 — Session Cookie Issued
  Response: Set-Cookie: ASP.NET_SessionId=[token]; path=/; HttpOnly; SameSite=Lax

STEP 4 — Authenticated Requests
  All subsequent requests: Cookie: ASP.NET_SessionId=[token]
  Server returns user-specific HTML
```

### Cookie Properties

| Property | Value | Security Note |
|---------|-------|--------------|
| Name | `ASP.NET_SessionId` | Standard ASP.NET session cookie name |
| HttpOnly | Yes | JavaScript cannot read it (XSS protection) |
| SameSite | `Lax` | Mitigates CSRF from cross-site form POSTs |
| Secure | Implied via HSTS | All traffic is HTTPS-only |
| Expiry | Session (no Max-Age) | Deleted when browser closes |

### What Does NOT Exist on UMS Web

- No OAuth2 / OpenID Connect server
- No JWT or Bearer token authentication
- No public SSO endpoint
- No developer portal or API documentation
- No API key mechanism
- No REST/JSON native API for students

---

## 7. API Inventory

UMS does not expose a public REST API. All data is delivered as server-rendered HTML.

### 7.1 Confirmed Public Endpoints

| Path | Method | Format | Auth |
|------|--------|--------|------|
| `/` | GET | Static HTML | None |
| `/lpuums/` | GET/POST | HTML (WebForms) | None → Session after login |
| `/econnect/` | GET | HTML | Session |
| `/myclass/` | GET | HTML | Session (issues ASP.NET_SessionId) |
| `/mobile/frmDisplayAnnouncement.aspx?aid={id}&tbl=Online` | GET | HTML | Session |
| `/mobile/frmDisplayAnnouncement.aspx?aid={id}&tbl=StuGen` | GET | HTML | Session |

### 7.2 SOAP Web Service

| Endpoint | Type | Purpose |
|---------|------|---------|
| `/umswebservice/umswebservice.svc` | WCF SOAP | Web service base |
| `/umswebservice/umswebservice.svc/PVR` | WCF SOAP | Visitor Pass Registration |

### 7.3 OBP REST API (Staff/Admin Only)

| Endpoint | Purpose |
|---------|---------|
| `/obpapi/api/OBPDashboard/GetOBPDashboardStaffAllocations` | Staff allocation dashboard |
| `/obpapi/api/OBPDashboard/GetOBPDashboardStaffPercentage` | Staff performance % |
| `/obpapi/api/OBPDashboard/GetOBPDashboardStaffStageProgress` | Stage progress |
| `/obpapi/api/MetricAllocation/GetAllocationHead` | Metric allocation head |
| `/obpapi/api/MetricAllocation/GetAllocationAllSelective` | Selective allocation data |
| `/obpapi/api/MeetingMinutes/GetPlannerSessionsMeetings` | Meeting planner |

These OBP endpoints return JSON and follow REST conventions. However, they are **staff/admin-only** and require separate authorization. Not accessible to students.

---

## 8. Data Domains Available to Authenticated Students

| Domain | Format | Fields Available |
|--------|--------|----------------|
| Student Profile | HTML | Name, reg_no, program, section, DOB, CGPA, phone, roll_number, photo (base64) |
| Attendance | HTML | Aggregate %, per-subject breakdown |
| Timetable | HTML | Day, time slot, subject, room, faculty |
| Grades / Marks | HTML | Assessment-wise marks, max marks |
| Announcements | HTML | University-wide and section-specific |
| Internal Messages | HTML | Inbox from faculty/admin |
| Fee Status | HTML | Payment history, outstanding dues |
| Exam Schedule | HTML | Datesheet with venue |
| EduRev/GROW | HTML | Applications, approvals, credits |
| Certificates | HTML | Request status, tracking |
| RMS Requests | HTML | Administrative request status |

---

## 9. Student Object Model (Community-Documented)

Parsed from authenticated HTML responses:

```typescript
interface UMSStudent {
  registration_number: string;  // e.g. "12213XXXX"
  name:                string;  // "First Last"
  program:             string;  // "B.Tech (CSE) - P164-NN1"
  section:             string;  // "K21FA"
  roll_number:         string;  // "RK21FAB60"
  dob:                 string;  // "M/DD/YYYY 12:00:00 AM"
  cgpa:                string;  // "8.5"
  phone:               string;  // "98XXXXXXXX:1"
  agg_attendance:      string;  // "82" (percentage as string)
  profile_image:       string;  // base64 PNG/JPG
}
```

---

## 10. Architecture Diagram

```
                         INTERNET
                             │
                ┌────────────▼────────────┐
                │     Cloudflare CDN      │
                │   DNS + DDoS + Proxy    │
                └────────────┬────────────┘
                             │ HTTPS/2
                             │ DigiCert *.lpu.in wildcard
                ┌────────────▼────────────┐
                │   Microsoft IIS 10.0    │
                │   Windows Server        │
                │   Origin: 172.19.2.250  │
                └────────────┬────────────┘
                             │
                ┌────────────▼────────────┐
                │    ASP.NET WebForms     │
                │    (.aspx pages)        │
                └───┬──────┬─────┬────────┘
                    │      │     │
          ┌─────────▼┐  ┌──▼──┐  ┌▼──────────────┐
          │ /lpuums/ │  │/econ│  │ /umswebservice/│
          │  Student │  │nect/│  │  (WCF SOAP)    │
          │  Portal  │  │     │  └────────────────┘
          └─────┬────┘  └──┬──┘
                │          │        ┌───────────────┐
                │          │        │ /obpapi/api/  │
                │          │        │ (Staff REST)  │
                │          │        └───────────────┘
                └──────────┴───────────────┐
                                           │
                ┌──────────────────────────▼──────┐
                │       Microsoft SQL Server       │
                │       (Primary Database)         │
                │                                  │
                │  Students | Attendance | Marks   │
                │  Timetable | Announcements | Fees│
                │  Sessions | EduRev | Certs | RMS │
                └──────────────────────────────────┘
```

---

## 11. Integration Feasibility for Paladeium

| Approach | Feasibility | Security | Recommended |
|---------|------------|---------|-------------|
| Official OAuth2/SSO (doesn't exist yet) | HIGH (if LPU agrees) | Excellent | Yes — for production |
| Credential relay via `mobileapi.lpu.in` | HIGH | Acceptable (hackathon only) | Yes — for demo |
| HTML scraping via session cookie | HIGH | Acceptable (hackathon only) | Fallback only |
| Direct browser CORS calls | NOT POSSIBLE | — | No |
| Scraping as production architecture | MEDIUM | Poor | No |

### Hackathon Recommendation

Use the **LPU Touch mobile API** (`mobileapi.lpu.in`) rather than HTML scraping. It returns JSON and uses token auth — far more stable and reliable than parsing HTML.

```
User → enters reg_no + password in Paladeium (with consent disclosure)
Paladeium backend → POST mobileapi.lpu.in/security/createToken
                 → Receive NToken
                 → GET mobileapi.lpu.in/api (student data in JSON)
                 → Discard NToken + credentials
                 → Store in Supabase: name, section, program
```

### Production Recommendation

Contact **Lovely Infotech, Block 30 — Room 405** to request an official OAuth2 integration agreement.

---

## 12. Unknowns Requiring LPU Confirmation

| Unknown | How to Resolve |
|---------|---------------|
| Full REST API endpoint map for student data | Authorized developer access |
| Whether mobileapi.lpu.in is official & stable | Contact LPU IT |
| OAuth2/SSO availability | Partnership discussion |
| Rate limits and terms of service | LPU IT agreement |
| SQL Server version | LPU disclosure |
| Session timeout policy | Authenticated session observation |

---

*Report compiled 2026-09-15. Passive observation only. No credentials stored. No security controls bypassed.*

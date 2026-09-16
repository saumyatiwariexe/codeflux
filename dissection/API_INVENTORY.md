# API Inventory — LPU UMS

**Important:** LPU UMS does not publish an official public API.
All entries below are sourced from:
- Directly observed HTTP headers (passive, no auth)
- Community-documented behavior (unofficial reverse-engineering)
- Public GitHub repositories

Entries are tagged by evidence source and reliability.

---

## Legend

| Tag | Meaning |
|-----|---------|
| `[OBSERVED-DIRECT]` | Confirmed by direct passive HTTP observation |
| `[COMMUNITY-DOCUMENTED]` | Reported in public GitHub repos/projects |
| `[INFERRED]` | Logically inferred from other confirmed data |
| `[UNKNOWN]` | Endpoint existence unverified |

---

## Section A — Observed Directly (No Authentication Required)

| Feature | Method | Host | Path | Request Type | Response Type | Auth | Evidence | Confidence |
|---------|--------|------|------|-------------|--------------|------|----------|------------|
| Portal Root | GET | ums.lpu.in | `/` | — | `text/html` (static) | None | Direct | HIGH |
| UMS App Root | GET | ums.lpu.in | `/lpuums/` | — | `text/html` (404 w/ IIS headers) | None | Direct | HIGH |
| eConnect | GET | ums.lpu.in | `/econnect/` | — | `text/html; charset=utf-8` | Session | Direct | HIGH |
| MyClass | GET | ums.lpu.in | `/myclass/` | — | `text/html; charset=utf-8` | Session (cookie issued) | Direct | HIGH |
| Induction | GET | ums.lpu.in | `/induction/` | — | HTML | Session | HTML source | MEDIUM |

---

## Section B — Community Documented (Unofficial Reverse Engineering)

> These endpoints were documented in public GitHub repositories by LPU students who reverse-engineered the UMS client.
> They have NOT been independently verified in this investigation.
> They may have changed or been removed.

### B.1 — Authentication

| Feature | Method | Host | Path | Request Format | Response Format | Auth | Evidence | Confidence |
|---------|--------|------|------|---------------|----------------|------|----------|------------|
| UMS Login | POST | ums.lpu.in | `/lpuums/` (form postback) | `application/x-www-form-urlencoded` (`__VIEWSTATE`, `reg_no`, `password`) | HTML + `Set-Cookie: ASP.NET_SessionId` | None (login endpoint) | Community | MEDIUM |
| Placement Portal Login | POST | (placement subdomain) | `/` | Form or JSON | `ASP.NET_SessionId` cookie | None (login) | Community | LOW |

### B.2 — Student Data (Authenticated)

All endpoints below require a valid `ASP.NET_SessionId` cookie.

| Feature | Method | Host | Path | Request Format | Response Format | Auth | Evidence | Confidence |
|---------|--------|------|------|---------------|----------------|------|----------|------------|
| Student Profile | GET/POST | ums.lpu.in | `/lpuums/` (dashboard) | Cookie in header | HTML (scraped for: name, reg_no, program, section, CGPA, phone, DOB, photo, attendance, roll_number) | ASP.NET_SessionId | Community | MEDIUM |
| Attendance | GET | ums.lpu.in | (dashboard page) | Cookie | HTML | ASP.NET_SessionId | Community | MEDIUM |
| Timetable / Classes | GET | ums.lpu.in | (timetable page) | Cookie | HTML | ASP.NET_SessionId | Community | MEDIUM |
| Announcements | GET | ums.lpu.in | `/mobile/frmDisplayAnnouncement.aspx?aid={id}&tbl=Online` | QueryString + Cookie | HTML | ASP.NET_SessionId | Community (README) | HIGH |
| Announcements (Student General) | GET | ums.lpu.in | `/mobile/frmDisplayAnnouncement.aspx?aid={id}&tbl=StuGen` | QueryString + Cookie | HTML | ASP.NET_SessionId | Community (README) | HIGH |
| Grades / Marks | GET | ums.lpu.in | (grades page) | Cookie | HTML | ASP.NET_SessionId | Community | MEDIUM |
| Messages (internal) | GET | ums.lpu.in | (messages page) | Cookie | HTML | ASP.NET_SessionId | Community | MEDIUM |

### B.3 — LPU Live (Separate Service, JSON API)

| Feature | Method | Host | Path | Request Format | Response Format | Auth | Evidence | Confidence |
|---------|--------|------|------|---------------|----------------|------|----------|------------|
| Search User | GET | lpulive.lpu.in | `/api/v1/misc/search_user?id={name_or_uid}` | QueryString | JSON | LPU Live token (`en_user_id`) | Community | MEDIUM |
| User Profile | GET | lpulive.lpu.in | (profile endpoint) | Cookie/Token | JSON | LPU Live token | Community | LOW |

**LPU Live JSON response structure (community-documented):**
```json
{
    "users": [
        {
            "full_name": "Student Name : UID",
            "user_id": 67152113,
            "fugu_user_id": 67152113,
            "email": "registrationNumber",
            "username": "registrationNumber",
            "department": "Program Name",
            "user_type": 1,
            "status": "ENABLED",
            "user_thumbnail_image": "url",
            "user_image": "url"
        }
    ]
}
```

---

## Section C — Inferred (Not Directly Observed)

| Feature | Method | Likely Path Pattern | Basis for Inference | Confidence |
|---------|--------|--------------------|--------------------|------------|
| Exam Schedule / Datesheet | GET | `/lpuums/datesheet` or similar | Community project mentions datesheet data | LOW |
| Library Resources | GET | Unknown | Standard UMS feature | LOW |
| Fee Details | GET | Unknown | Standard UMS feature | LOW |
| Hostel Information | GET | Unknown | Standard UMS feature | LOW |
| Transport Schedule | GET | Unknown | Standard UMS feature | LOW |

---

## Section D — Not Accessible / Unknown

| Feature | Status | Reason |
|---------|--------|--------|
| Official REST API | DOES NOT EXIST (publicly) | No documentation, no evidence |
| GraphQL endpoint | UNKNOWN | No evidence found |
| WebSocket endpoint | UNKNOWN | No evidence found (except possibly LPU Live) |
| OAuth2 / OIDC server | DOES NOT EXIST (publicly) | No `.well-known/openid-configuration` published |
| API documentation portal | DOES NOT EXIST (publicly) | No developer portal found |
| Webhook support | UNKNOWN | No evidence |

---

## Data Model — Student Object (Community Documented)

Based on the data fields returned by community scrapers:

```typescript
interface UMSStudent {
    registration_number: string;   // e.g. "12213XXXX"
    name: string;                  // Full name
    program: string;               // e.g. "MCA (P164-NN1)"
    section: string;               // e.g. "P12614"
    profile_image: string;         // base64 encoded image
    dob: string;                   // "M/DD/YYYY 12:00:00 AM"
    cgpa: string;                  // e.g. "6.9"
    phone: string;                 // e.g. "9090909090:1"
    agg_attendance: string;        // Aggregate attendance %
    roll_number: string;           // e.g. "RP12614B60"
    cookie: string;                // ASP.NET_SessionId=[REDACTED]
}
```

---

## Notes on Endpoint Stability

1. These endpoints have **no SLA or versioning** — LPU can change them at any time
2. Community scrapers frequently break when UMS updates its HTML structure
3. No rate limiting documentation is available — aggressive polling may result in IP ban
4. The `/mobile/` path endpoints appear to be the most stable (used by LPU Touch app itself)

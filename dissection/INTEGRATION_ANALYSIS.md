# Integration Analysis — Paladeium × LPU UMS

---

## Overview

This document analyzes how the Paladeium campus exploration application can integrate with LPU UMS data. It covers all feasible integration approaches, their technical and legal implications, and concrete recommendations for both the hackathon demo and production deployment.

---

## Data Ownership Model

Before analyzing integration approaches, it is critical to establish which data lives where:

### Data That MUST Stay in LPU UMS

| Data Domain | Why UMS Owns It |
|-------------|----------------|
| Student credentials (password) | Never leave UMS — not our concern |
| Academic records (official) | University property, legally protected |
| Official attendance records | Must be authoritative — UMS is source of truth |
| Official grades/CGPA | Same — must not be duplicated as authoritative |
| Enrollment and program data | Institutional administrative data |
| Faculty assignments | University HR data |
| Official timetable | Scheduled by university operations |
| Fee records | Financial data — strict privacy |
| Student photos (ID quality) | Biometric-adjacent; strict privacy |

### Data That Lives in OUR Database (Paladeium)

| Data Domain | Why We Own It |
|-------------|--------------|
| Campus buildings (3D, GPS bounds) | We created this |
| POIs (Points of Interest) | We curated this |
| Fog-of-war H3 cell states | User exploration data |
| Quest definitions and completions | Our game layer |
| EduRev quest-to-credit mappings | Our integration logic |
| SquadUp profiles and swipe data | Our matching system |
| LostPulse item reports | Our community feature |
| EventHub event definitions | Our event layer |
| Discovery achievements | Our gamification |
| Social connections (squads) | Our social graph |
| User preferences and settings | Our app configuration |

### Data We Derive From UMS (Read Once, Cache)

| Derived Data | Source UMS Field | Our Usage |
|-------------|-----------------|-----------|
| Display name | `name` | Profile display |
| Program/School | `program` | Squad matching (skill context) |
| Section code | `section` | Map clustering, EduRev eligibility |
| CGPA (approximate) | `cgpa` | EduRev benefit calculator context |
| Aggregate attendance | `agg_attendance` | EduRev benefit calculator context |
| Registration number (hashed) | `registration_number` | Internal identifier |
| Profile photo | `profile_image` | Avatar (with user consent) |

We store **derived, non-sensitive data only**. We never store passwords or session cookies.

---

## Integration Approaches

### Approach A — Official API (Ideal, Not Currently Available)

**Classification:** A — Official API Required

```
User authenticates with LPU SSO/OAuth2
         ↓
Paladeium receives scoped access token from LPU
         ↓
Paladeium API calls LPU official endpoints
         ↓
Receives: name, section, timetable, attendance
         ↓
Displays in Paladeium + feeds EduRev module
```

**Technical Feasibility:** HIGH — once LPU provides the integration point
**Security:** EXCELLENT — user never enters password in Paladeium
**Reliability:** HIGH — official SLA
**Maintenance:** LOW — stable versioned API
**Legal:** CLEAR — authorized by LPU
**Status:** **NOT CURRENTLY AVAILABLE** — LPU does not publish an OAuth2/OIDC endpoint

**Action Required:** Formal partnership request to LPU IT (Lovely Infotech, Block 30-405)

---

### Approach B — Credential-Relay Proxy (Hackathon Demo)

**Classification:** D — Browser/Session Integration (Acceptable for Demo)

```
User enters UMS reg_no + password in Paladeium login screen
         ↓ (user is informed this goes to UMS only)
Paladeium Backend (Fastify/Node.js) POSTs to UMS login endpoint
         ↓
Receives ASP.NET_SessionId session cookie
         ↓
Makes one-time fetch: profile + timetable data
         ↓
Extracts: name, section, program, CGPA, attendance, timetable
         ↓
Discards cookie + credentials IMMEDIATELY (within same request cycle)
         ↓
Stores only derived data in Paladeium DB (Supabase)
         ↓
User never asked for UMS password again
```

**Technical Feasibility:** HIGH — community projects prove this works
**Security:** POOR for production (password handled by third party) / ACCEPTABLE for demo with full disclosure
**Reliability:** MEDIUM — UMS HTML structure changes break scrapers
**Maintenance:** HIGH — must track UMS HTML changes
**Legal:** GREY AREA — terms of service review needed; credential relay requires explicit user consent

**Implementation requirements for hackathon:**
1. Clear UI disclosure: "Your UMS credentials are sent directly to LPU's servers. Paladeium does not store your password."
2. HTTPS only
3. Zero credential logging
4. Immediate discard after data extraction
5. Data minimization (fetch only what's needed)

**Status:** **VIABLE FOR HACKATHON DEMO** — do NOT use in production

---

### Approach C — Client-Side Session Handoff

**Classification:** D — Browser/Session Integration

```
User logs in to UMS in a browser tab normally
         ↓
User copies their session token from browser storage
         ↓
Pastes into Paladeium settings
         ↓
Paladeium uses session to fetch data (via our backend proxy)
```

**Technical Feasibility:** MEDIUM — cumbersome UX
**Security:** BETTER than credential relay (user never enters password in our app) / Still requires trust
**Reliability:** LOW — sessions expire; user must repeat process
**Maintenance:** HIGH
**Legal:** GREY AREA — same concerns as credential relay

**Status:** NOT RECOMMENDED — poor UX, fragile

---

### Approach D — Screen Scraping via Browser Extension

**Classification:** E — Not Appropriate for Production

```
Browser extension runs on UMS pages
         ↓
Extracts data client-side using DOM parsing
         ↓
POSTs extracted data to Paladeium
```

**Technical Feasibility:** MEDIUM
**Security:** HIGH trust requirement (extension reads all UMS pages)
**Legal:** Likely violates UMS terms of service
**Status:** NOT RECOMMENDED

---

### Approach E — Manual Data Entry

**Classification:** B — User-provided, no API needed

```
User manually enters their section, timetable, program
         ↓
Paladeium uses this for EduRev calculations
```

**Technical Feasibility:** HIGH
**Security:** EXCELLENT (no UMS credentials involved)
**Reliability:** HIGH (user-controlled)
**Maintenance:** LOW
**Status:** VIABLE FALLBACK — use if UMS integration fails for hackathon

---

## Recommended Architecture for Paladeium

### Hackathon Phase (2026 Demo)

```
┌─────────────────────────────────────────────────────────┐
│                   Paladeium App (Expo)                  │
│                                                         │
│   1. Onboarding: "Connect your UMS"                     │
│   2. User enters reg_no + password (with disclosure)    │
│   3. One-time fetch via Paladeium backend               │
│   4. Confirmation: "Your section is X, CGPA is Y"       │
│   5. UMS password NEVER stored                          │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS POST (reg_no + password)
                         │  [user-disclosed, one-time]
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Paladeium Backend (Fastify)                │
│                                                         │
│   POST /api/ums/sync                                    │
│   1. Forward credentials to ums.lpu.in                  │
│   2. Receive ASP.NET_SessionId                          │
│   3. Fetch: profile + timetable                         │
│   4. Parse HTML response                                │
│   5. Discard credentials + cookie                       │
│   6. Store in Supabase:                                 │
│      { name, section, program, cgpa, attendance }       │
└────────────────────────┬────────────────────────────────┘
                         │  Store derived data only
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                      │
│                                                         │
│   users table: name, section, program, cgpa_approx      │
│                attendance_approx                        │
│                                                         │
│   NO: ums_password, ums_session_cookie                  │
└─────────────────────────────────────────────────────────┘
```

### Production Phase (Post-Hackathon, LPU Partnership)

```
┌─────────────────────────────────────────────────────────┐
│                   Paladeium App (Expo)                  │
│                                                         │
│   "Sign in with LPU" button                             │
└────────────────────────┬────────────────────────────────┘
                         │  Redirect to LPU OAuth2 server
                         ▼
┌─────────────────────────────────────────────────────────┐
│          LPU Official SSO / OAuth2 Server               │
│                                                         │
│   User authenticates directly with LPU                 │
│   Paladeium NEVER sees the password                     │
│   Returns scoped access token                          │
└────────────────────────┬────────────────────────────────┘
                         │  Access token (scoped)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Paladeium Backend (Fastify)                │
│                                                         │
│   Token verification + data fetch                       │
│   Access: name, section, program, timetable             │
│   No access: password, full academic records            │
└─────────────────────────────────────────────────────────┘
```

---

## EduRev Connect Integration

EduRev is the most important UMS data integration point for Paladeium. The data flow:

```
User completes CampusVerse quest (GPS-verified)
         ↓
Quest tagged as "EduRev-eligible" (GROW / Course Equivalence / Attendance)
         ↓
Paladeium backend logs: { user_id, quest_id, timestamp, gps_proof }
         ↓
EduRev module calculates:
  - GROW credits earned this semester
  - Course equivalence opportunities
  - Attendance relaxation eligibility
         ↓
User sees:
  - "You have earned X GROW credits — eligible for Y benefit"
  - "You need Z more eligible activities for attendance relaxation"
         ↓
User takes evidence to LPU administration manually
(no official API to auto-submit — requires manual process)
```

The EduRev integration does NOT require UMS write access — it is purely a **calculator/tracker** that helps users understand their position relative to official LPU policies. Our system tracks our own verified data; official submission to LPU remains a manual process.

---

## Data Freshness Strategy

| Data Domain | Freshness Needed | Strategy |
|-------------|-----------------|---------|
| Name / Section / Program | Once per semester | UMS sync on first login; manual update option |
| CGPA / Attendance | Per semester | Re-sync option in settings; not real-time |
| Timetable | Per semester (stable) | Re-sync when schedule changes |
| EduRev quest data | Real-time | Our own system; no UMS dependency |
| Active quests | Real-time | Our own system |
| Events | Real-time | Our own system (EventHub) |

---

## Integration Feasibility Matrix

| Approach | Feasibility | Security | Reliability | Legal | Hackathon | Production |
|---------|------------|---------|------------|-------|-----------|------------|
| A — Official API | HIGH (if LPU cooperates) | EXCELLENT | HIGH | CLEAR | NO (not available) | YES |
| B — Credential-Relay | HIGH | POOR/ACCEPTABLE | MEDIUM | GREY | YES | NO |
| C — Session Handoff | MEDIUM | BETTER | LOW | GREY | MAYBE | NO |
| D — Extension | MEDIUM | POOR | LOW | LIKELY VIOLATES TOS | NO | NO |
| E — Manual Entry | HIGH | EXCELLENT | HIGH | CLEAR | YES (fallback) | YES (fallback) |

---

## Hackathon Demo Script Recommendation

For the hackathon demo, use **Approach B** with the following narrative:

1. Show the "Connect UMS" onboarding screen with clear disclosure text
2. Enter demo credentials (your own student account) live on stage
3. Show the one-time sync animation: "Fetching from UMS..."
4. Show the result: name, section, program imported
5. Show EduRev module reflecting the correct section/program for benefit calculation
6. Show how CampusVerse quests feed into EduRev tracker

Then narrate: *"In production, we would implement this as an official LPU OAuth2 integration so no credentials ever leave LPU's servers."*

This demonstrates both the current hackathon capability and the production vision.

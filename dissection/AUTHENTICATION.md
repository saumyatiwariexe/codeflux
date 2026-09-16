# Authentication Analysis — LPU UMS

---

## Authentication Model

**Type:** ASP.NET Cookie-Based Session Authentication
**Confidence:** HIGH

---

## Login Flow (Observed + Community-Documented)

```
Step 1 — User Submits Credentials
───────────────────────────────────────────────────────────────
Client → POST https://ums.lpu.in/lpuums/ (or sub-path login form)
Content-Type: application/x-www-form-urlencoded

Form fields (WebForms postback pattern):
  __VIEWSTATE      = [base64-encoded server state]
  __EVENTVALIDATION = [server-generated validation token]
  __doPostBack     = (event target/argument)
  RegistrationNo   = [student registration number]
  Password         = [student password]

Step 2 — Server Validates
───────────────────────────────────────────────────────────────
IIS/ASP.NET receives postback
ASP.NET runtime deserializes __VIEWSTATE
Business logic validates credentials against SQL Server
On success: ASP.NET creates server-side session object

Step 3 — Session Cookie Issued
───────────────────────────────────────────────────────────────
Server → Response:
  HTTP/2 302 (redirect to dashboard) or 200
  Set-Cookie: ASP.NET_SessionId=[REDACTED]; path=/; HttpOnly; SameSite=Lax

Step 4 — Subsequent Authenticated Requests
───────────────────────────────────────────────────────────────
Client → GET/POST [any UMS page]
  Cookie: ASP.NET_SessionId=[REDACTED]

Server looks up session in server-side session store
Returns user-specific data in rendered HTML
```

---

## Cookie Analysis

| Property | Value | Notes |
|----------|-------|-------|
| Cookie Name | `ASP.NET_SessionId` | Standard ASP.NET session cookie name |
| Path | `/` | Scoped to all paths on domain |
| HttpOnly | Yes | Cannot be read by JavaScript (XSS protection) |
| SameSite | `Lax` | Sent with top-level navigations; blocks cross-site POSTs |
| Secure | Implied (HTTPS-only site, HSTS enforced) | All traffic is HTTPS |
| Domain | Not explicitly set in observed header | Defaults to issuing domain |
| Expiry | Session (no Max-Age or Expires set) | Expires when browser closes |

**Observed directly:**
```
set-cookie: ASP.NET_SessionId=[REDACTED]; path=/; HttpOnly; SameSite=Lax
```
Source: `curl -sI https://ums.lpu.in/myclass/`

---

## Session Lifetime

- **Client side:** Session cookie with no `Max-Age` or `Expires` → browser session cookie (deleted on browser close)
- **Server side:** ASP.NET default session timeout is 20 minutes of inactivity, but this can be configured
- **Actual timeout:** Unknown — requires authenticated session observation
- Community tools that maintain sessions implement periodic refresh requests to keep session alive

---

## What the Cookie IS and IS NOT

| Is | Is NOT |
|----|--------|
| A random session identifier | A JWT or self-contained token |
| Validated server-side on each request | Signed or verifiable client-side |
| Tied to a server-side session object | A bearer token for a REST API |
| User-specific and ephemeral | Shareable between users |

---

## Authentication Security Properties

| Property | Status | Evidence |
|----------|--------|---------|
| HTTPS enforced | YES | HSTS header, no HTTP fallback |
| HttpOnly cookie | YES | Observed header |
| SameSite=Lax | YES | Mitigates CSRF for cross-site POSTs |
| CORS restricted | YES | `access-control-allow-origin: https://*.lpu.in` |
| Frame restriction | YES | `content-security-policy: frame-ancestors https://*.lpu.in` |

---

## Authentication for Sub-Applications

| Sub-Application | Auth Mechanism | Notes |
|----------------|----------------|-------|
| `/lpuums/` | ASP.NET_SessionId | Main UMS session |
| `/econnect/` | ASP.NET_SessionId | Likely shared or separate session |
| `/myclass/` | ASP.NET_SessionId | Observed issuing this cookie |
| `lpulive.lpu.in` | Separate token (`en_user_id`) | Different auth system |
| `oas.lpu.in` | Unknown | Likely ASP.NET session (same stack) |
| Placement Portal | ASP.NET_SessionId | Community-documented |

---

## Logout Behavior

- **Unknown** — not observed directly (requires authenticated session)
- Typical ASP.NET WebForms logout: server-side `Session.Abandon()` + clear cookie
- INFERRED: Navigating to a logout URL invalidates the server-side session; cookie becomes orphaned

---

## Integration Implications

### Why OAuth2/JWT Cannot Be Assumed

1. No `/.well-known/openid-configuration` endpoint exists on `ums.lpu.in`
2. No `Authorization: Bearer` pattern documented anywhere
3. The session-based model is fundamental to ASP.NET WebForms architecture
4. Community tools universally use the `ASP.NET_SessionId` cookie, not bearer tokens

### Integration Option 1 — Credential Relay (Hackathon only)

```
User enters UMS credentials in Paladeium
     ↓
Paladeium backend POSTs to UMS login endpoint
     ↓
Receives ASP.NET_SessionId cookie
     ↓
Uses cookie to fetch student data (one-time)
     ↓
Extracts: name, reg_no, program, section, timetable
     ↓
Discards cookie + credentials immediately
     ↓
Stores only derived non-sensitive data in Paladeium DB
```

> [!CAUTION]
> This approach requires the user to enter their UMS password into Paladeium. This is a security anti-pattern. It is ONLY acceptable for a hackathon demo with:
> - Explicit user consent and clear disclosure
> - Immediate, verifiable credential discard
> - No persistence of raw passwords
> - HTTPS-only transport
> - NOT acceptable for production deployment

### Integration Option 2 — Official SSO (Production)

```
LPU IT provisions OAuth2/SAML integration for Paladeium
     ↓
User authenticates directly with LPU servers (no password to Paladeium)
     ↓
Paladeium receives a scoped access token
     ↓
Accesses only approved data fields
```

This is the only production-safe architecture. Requires official LPU cooperation.

---

## Security Note on Credential Storage

**NEVER store UMS passwords.** Even for the hackathon demo:
- Accept credentials → immediately POST to UMS → receive session cookie → fetch data → discard cookie + credentials
- Zero credential persistence on Paladeium servers
- Display this flow transparently to users in the UI

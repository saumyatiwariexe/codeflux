# Security Boundaries — LPU UMS

This document defines what is accessible, what is not, and why — for both ethical and technical reasons.

---

## Confirmed Security Controls (Directly Observed)

| Control | Implementation | Status | Evidence |
|---------|--------------|--------|---------|
| HTTPS only | HSTS max-age=31536000 | ACTIVE | `strict-transport-security` header |
| Clickjacking protection | `X-Frame-Options: SAMEORIGIN` | ACTIVE | `x-frame-options` header |
| CORS restriction | `access-control-allow-origin: https://*.lpu.in` | ACTIVE | Header on `/lpuums/` |
| Frame embedding restriction | `content-security-policy: frame-ancestors https://*.lpu.in` | ACTIVE | Header on `/lpuums/` |
| Cross-origin resource policy | `cross-origin-resource-policy: cross-origin` | ACTIVE | Header |
| Session cookie security | `HttpOnly; SameSite=Lax` | ACTIVE | Observed Set-Cookie |
| DDoS protection | Cloudflare CDN | ACTIVE | NS records |
| TLS certificate | DigiCert wildcard *.lpu.in | ACTIVE | Certificate inspection |

---

## What IS Publicly Accessible (No Authentication)

| Resource | Why Accessible | Evidence |
|---------|---------------|---------|
| `ums.lpu.in/` — portal selector page | Intentionally public | Direct HTTP fetch |
| HTTP response headers | Publicly delivered | Direct observation |
| TLS certificate metadata | Public PKI | OpenSSL |
| DNS records | Public DNS | dig |
| HTML source of login portal | Intentionally public | Direct fetch |
| Static assets (CSS, JS, images) of login portal | Intentionally public | HTML source refs |
| Announcement pages (with valid announcement ID) | Mobile-path pages publicly readable when ID known | Community documentation |

---

## What IS Accessible Only With Authentication

| Resource | Authentication Required | Notes |
|---------|------------------------|-------|
| Student profile data | ASP.NET_SessionId | Own data only |
| Attendance records | ASP.NET_SessionId | Own data only |
| Timetable | ASP.NET_SessionId | Own data only |
| Grades / Marks | ASP.NET_SessionId | Own data only |
| Messages | ASP.NET_SessionId | Own data only |
| Academic records | ASP.NET_SessionId | Own data only |
| CGPA | ASP.NET_SessionId | Own data only |

A valid session is obtained by authenticating with your OWN student credentials only. Accessing another student's data is not authorized and not investigated.

---

## What Was NOT Investigated (Security Boundaries)

The following were explicitly NOT investigated, per the scope rules:

| Item | Why Not Investigated |
|------|---------------------|
| Other students' data | Would require unauthorized access to another person's session |
| Database ports (1433, 5432, etc.) | Port scanning is unauthorized enumeration |
| Internal LPU IP ranges | Not authorized; would constitute unauthorized network reconnaissance |
| SQL injection testing | Unauthorized exploitation attempt |
| Authentication bypass | Unauthorized security bypass |
| Session fixation testing | Unauthorized |
| SSRF testing | Unauthorized |
| Admin panel enumeration | Not authorized |
| Backup/config file discovery (/.env, /web.config) | Unauthorized enumeration |
| Forced browsing / directory busting | Unauthorized |
| Credential guessing/brute-force | Absolutely prohibited |
| API endpoint fuzzing | Unauthorized |
| JavaScript bundle analysis (authenticated) | Requires authenticated session not performed here |

All such steps were skipped and are documented as:
**"Not investigated because it requires unauthorized access or security bypass."**

---

## Security Architecture Assessment (Passive Observation Only)

### Positive Security Indicators

1. **HSTS enforced** — Prevents HTTP downgrade attacks
2. **HttpOnly session cookie** — Prevents JavaScript-based session theft (XSS mitigation)
3. **SameSite=Lax** — Mitigates CSRF attacks from cross-site origins
4. **X-Frame-Options: SAMEORIGIN** — Prevents clickjacking from external sites
5. **CORS restricted to *.lpu.in** — Prevents unauthorized cross-origin API calls
6. **CSP frame-ancestors** — Defense-in-depth against frame embedding
7. **Cloudflare** — DDoS mitigation layer
8. **DigiCert wildcard TLS** — Proper certificate management
9. **No exposed framework version** (IIS version is disclosed but not ASP.NET version)

### Neutral/Unknown Security Factors

| Factor | Status |
|--------|--------|
| Password hashing algorithm | Unknown (not observable) |
| SQL injection mitigations | Unknown (not tested) |
| Rate limiting on login | Unknown (not tested) |
| Account lockout policy | Unknown (not tested) |
| Log monitoring / SIEM | Unknown (not observable) |
| WAF (Web Application Firewall) | Possible via Cloudflare (standard Cloudflare feature) |
| Input validation | Unknown (not tested) |
| Content-Security-Policy for scripts | Not observed on main UMS app pages (login portal only checked) |

---

## What Our Application Must NOT Do

| Prohibition | Reason |
|-------------|--------|
| Store UMS passwords | Violates user trust and security; no legal basis |
| Store ASP.NET session cookies long-term | Session cookies are temporary credentials |
| Access other students' accounts | Unauthorized; illegal |
| Attempt to probe undisclosed endpoints | Unauthorized |
| Attempt to circumvent CORS | Would be a security bypass |
| Bulk-download UMS data | Not authorized; potential DoS |
| Cache UMS responses without user consent | Privacy violation |
| Transmit UMS credentials over HTTP | NEVER — HTTPS only |
| Log UMS credentials in any system | Never — must discard immediately |
| Share UMS session tokens with third parties | Never |

---

## Our Application's Security Commitments

For the UMS integration component of Paladeium:

1. **Zero credential persistence** — Passwords are used once and immediately discarded
2. **Zero cookie persistence** — Session cookies are used for one fetch cycle and discarded
3. **HTTPS only** — All communication to UMS goes over HTTPS
4. **Data minimization** — Only fetch what's needed (name, section, program, timetable basics)
5. **Transparent disclosure** — Users explicitly consent to credential-relay in onboarding
6. **User control** — Users can disconnect UMS integration at any time (deletes cached derived data)
7. **No bulk access** — Only fetch authenticated user's own data
8. **Rate limiting** — Implement client-side and server-side throttling to avoid hammering UMS

---

## Responsible Disclosure Note

During this investigation, no vulnerabilities were discovered that meet the threshold for responsible disclosure. The following observations are made:

- The `ASP.NET_SessionId` cookie lacks `Secure` flag explicitly set (though all traffic is HTTPS, the flag should be explicit) — **LOW risk** given HSTS
- No `Content-Security-Policy` header was observed on the main UMS pages (login portal has none, authenticated pages not checked) — if applicable, this would be a hardening recommendation

These are observations only. No exploitation was attempted or possible from passive observation.

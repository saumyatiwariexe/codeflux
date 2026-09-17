# Technology Stack — LPU UMS Fingerprinting Report

**Method:** Passive fingerprinting — HTTP headers, HTML analysis, DNS, TLS, public source research
**Date:** 2026-09-15

---

## Confirmed Technologies

### Web Server

| Technology | Value | Confidence | Evidence |
|-----------|-------|------------|---------|
| Web Server | Microsoft IIS 10.0 | HIGH | `Server: Microsoft-IIS/10.0` header (all probed paths) |
| OS | Windows Server (2016/2019/2022) | HIGH | IIS 10.0 ships exclusively on Windows Server |
| Transport | HTTPS/2 | HIGH | HTTP/2 protocol confirmed by curl |
| HSTS | Enabled, max-age=31536000 | HIGH | `strict-transport-security` header |

### Application Framework

| Technology | Confidence | Evidence | Reasoning |
|-----------|------------|---------|-----------|
| ASP.NET | HIGH | `X-Powered-By: ASP.NET` header | Runtime auto-emits this unless suppressed |
| ASP.NET WebForms | HIGH | `.aspx` URLs, `frm` page naming, community scraper behavior | WebForms = `.aspx` extensions + server controls |
| ASP.NET Core | NOT DETECTED | No evidence | Would have different header pattern; no .aspx on Core |
| ASP.NET MVC | POSSIBLE (parallel) | No direct evidence | May be used for newer features alongside WebForms |

### Frontend (Login Portal)

| Technology | Confidence | Evidence |
|-----------|------------|---------|
| HTML5 | HIGH | `<!DOCTYPE html>` |
| Bootstrap 4/5 | HIGH | `assets/css/bootstrap.min.css` in HTML source |
| jQuery 3.6.0 | HIGH | `assets/js/jquery-3.6.0.min.js` explicitly in HTML |
| Font Awesome | HIGH | `assets/css/fonts/font-awesome/css/font-awesome.min.css` |
| Flaticon | HIGH | `assets/css/fonts/flaticon/font/flaticon.css` |
| Google Fonts (Poppins) | HIGH | `fonts.googleapis.com/css2?family=Poppins` |
| Bootstrap Bundle JS | HIGH | `assets/js/bootstrap.bundle.min.js` |
| Custom JS (contentZoomSlider) | HIGH | `assets/content-zoom-slider.js` |

The login portal `ums.lpu.in/` is a **static HTML page** (not an ASP.NET page itself — it is a plain HTML selector that links to sub-applications). This explains why it lacks `__VIEWSTATE` and session cookie.

### DNS and Network Infrastructure

| Technology | Confidence | Evidence |
|-----------|------------|---------|
| Cloudflare DNS | HIGH | NS records: `jihoon.ns.cloudflare.com`, `wren.ns.cloudflare.com` |
| DigiCert TLS | HIGH | Certificate issuer chain |
| Microsoft 365 Email | HIGH | MX: `lpu-in.mail.protection.outlook.com` |

---

## Technologies NOT Detected

The following technologies were searched for and **not found** in publicly observable evidence:

| Technology | Status | Evidence Checked |
|-----------|--------|-----------------|
| React | NOT DETECTED | No `react`, `__webpack_require__` in login page JS |
| Angular | NOT DETECTED | No `ng-app`, `angular.js` in login page |
| Vue.js | NOT DETECTED | No `vue.js`, `v-app` in login page |
| Next.js | NOT DETECTED | No `_next/` paths |
| GraphQL | NOT DETECTED | No `/graphql` endpoint, no `application/graphql` headers |
| JWT | NOT DETECTED | No `Authorization: Bearer` pattern observed |
| OAuth2 | NOT DETECTED | No `/.well-known/openid-configuration` |
| WebSockets | NOT DETECTED | No upgrade headers (may exist but not observable without auth) |
| Nginx | NOT DETECTED | Server header is IIS |
| Apache | NOT DETECTED | Server header is IIS |
| Node.js | NOT DETECTED | No evidence on UMS (may power LPU Live separately) |
| PHP | NOT DETECTED | No `.php` extensions, no PHP headers |
| Webpack (main app) | UNKNOWN | Would only be visible in authenticated JS bundles |

---

## Mobile App Technology Stack

| Technology | Confidence | Evidence |
|-----------|------------|---------|
| Package Name | `ums.lovely.university` | HIGH | App store listings (APKPure, Uptodown, Google Play) |
| Platforms | Android + iOS | HIGH | Both app stores have listings |
| Architecture | Hybrid WebView | LIKELY | App store description + community analysis |
| Framework | Ionic + Cordova or Capacitor | LIKELY | Industry standard for similar university apps; no binary analysis |
| Native Android (Kotlin/Java) | UNLIKELY | No evidence |
| React Native | UNLIKELY | No evidence |
| Flutter | UNLIKELY | No evidence |

### Reasoning for Hybrid WebView Conclusion

1. The UMS has a dedicated `/mobile/` path with mobile-optimized `.aspx` pages
2. A native app with a true REST API would not need mobile-specific HTML pages
3. The app store description focuses on "24/7 access" to the management portal, language consistent with WebView wrappers
4. LPU has incentive to maintain one codebase (web + WebView) rather than a separate mobile API
5. Community API projects work by scraping the same HTML that the mobile app renders — confirming the mobile app loads HTML pages

---

## Technology Evolution Assessment

The UMS technology stack shows characteristics of a **legacy system that has grown over many years**:

| Era | Evidence |
|-----|---------|
| Early 2000s–2010s | ASP.NET WebForms (now considered legacy) |
| 2010s–2020s | Bootstrap, jQuery added; mobile path added |
| 2020s | HSTS, SameSite cookie flags, Cloudflare DNS (security improvements) |
| Present | No SPA framework, no REST API, no modern auth (OAuth2/JWT) |

This is a **monolithic legacy web application** with security hardening applied incrementally. A full rewrite to a modern API-first architecture would require significant investment and organizational will.

---

## LPU Live — Separate, More Modern Stack

The `lpulive.lpu.in` service appears to use a **different, more modern stack**:

| Technology | Confidence | Evidence |
|-----------|------------|---------|
| Token-based auth | LIKELY | Community documentation of `en_user_id` token |
| JSON API | LIKELY | Community search API returns structured JSON |
| Real-time messaging | LIKELY | "Premier real-time chat" description implies WebSocket |
| Node.js or similar | POSSIBLE | Modern JSON API pattern suggests non-ASP.NET |

LPU Live is described as "developed by students" on the UMS portal homepage, which may explain why it uses a more modern architecture than the legacy UMS.

---

## Third-Party Services Observed

| Service | Purpose | Confidence |
|---------|---------|------------|
| Cloudflare | DNS, CDN, DDoS protection | HIGH |
| DigiCert/GeoTrust | TLS certificate authority | HIGH |
| Microsoft 365 | Email infrastructure | HIGH |
| Google Fonts | Font delivery (Poppins) | HIGH |
| Google Site Verification | SEO/Search Console | HIGH |

**Google Site Verification meta tag observed:**
```html
<meta name="google-site-verification" content="kduKXMhUIRlF2glbTU_-KgCHVJFiz5Uyv7i2yX33Z2A" />
```
This confirms LPU actively manages SEO for the UMS login portal.

# LPU UMS Architecture Dissection

## Purpose

This directory contains a comprehensive passive architecture analysis of the Lovely Professional University (LPU) University Management System (UMS) ecosystem. The research objective is to understand the technology stack, API architecture, authentication model, and integration opportunities for the Paladeium campus exploration application.

## Scope

This investigation is strictly limited to:
- Publicly observable HTTP response headers
- Publicly delivered HTML, CSS, and JavaScript
- DNS record inspection
- TLS certificate metadata
- Public GitHub repositories documenting UMS behavior
- Public web sources discussing UMS architecture
- HTTP response structure analysis (no authentication bypass)

## Tools Used

| Tool | Purpose |
|------|---------|
| `curl` | HTTP header and HTML fetching |
| `dig` | DNS record lookup |
| `openssl s_client` | TLS certificate inspection |
| `grep`, `awk`, `sed` | Text processing and analysis |
| `python3` | JSON parsing |
| Web search | Public source research |
| GitHub public repositories | Community-documented behavior |

## Investigation Date

**2026-09-15** (IST, UTC+5:30)

## Environment

- **OS:** Kali GNU/Linux Rolling 2026.2 (WSL2 on Windows)
- **Kernel:** 6.6.87.2-microsoft-standard-WSL2
- **Primary Target Host:** `ums.lpu.in` (IP: 172.19.2.250)

## Directory Structure

```
dissection/
├── README.md                  ← This file
├── EXECUTIVE_SUMMARY.md       ← Plain-language summary of all findings
├── FINDINGS.md                ← Structured finding entries (F-001 through F-NNN)
├── ARCHITECTURE.md            ← Reconstructed system architecture diagram
├── API_INVENTORY.md           ← Observed/documented API endpoints
├── AUTHENTICATION.md          ← Authentication model analysis
├── TECHNOLOGY_STACK.md        ← Technology fingerprinting results
├── DATABASE_ANALYSIS.md       ← Database technology inference
├── INTEGRATION_ANALYSIS.md    ← Campus app integration strategy
├── SECURITY_BOUNDARIES.md     ← What is and is not accessible
│
├── EVIDENCE/
│   ├── headers/               ← Captured HTTP response headers (redacted)
│   ├── html/                  ← Public HTML source captures
│   ├── javascript/            ← JS bundle notes (none captured — login required)
│   ├── dns/                   ← DNS record captures
│   └── screenshots/           ← Browser screenshots (manual, not automated)
│
└── RAW/                       ← Raw third-party source materials
    └── Ryuk_UMS_Api_README.md ← README from public unofficial UMS API repo
```

## Methodology

1. **DNS Reconnaissance** — Passive DNS record lookup via `dig` for A, CNAME, MX, NS records
2. **HTTP Fingerprinting** — Header analysis via `curl -sI` (no authentication)
3. **TLS Analysis** — Certificate inspection via `openssl s_client`
4. **HTML Analysis** — Public login page source inspection
5. **Public Source Research** — Web search + official LPU pages + public GitHub repositories
6. **Community Documentation Analysis** — Review of unofficial UMS API projects that document observed behavior

## Limitations

- **No authenticated session** — All JavaScript bundle analysis, XHR/Fetch network traces, and API response format confirmation require an authenticated student session, which was not performed in this automated phase.
- **No APK analysis** — The official LPU Touch APK was not downloaded or analyzed; findings on the mobile app are sourced from public documentation and app store listings.
- **No browser network tab** — Phase 5 (browser network analysis) requires a live authenticated student session; results are documented based on community evidence only.
- **No static JavaScript bundles captured** — The UMS application's JS bundles are loaded after authentication; none were captured.
- **Dynamic architecture** — LPU's proprietary system may change without notice; community-documented endpoints may be stale.

## Findings Requiring Official LPU Confirmation

1. Whether an official OAuth2 / API key integration is available for authorized third-party apps
2. Whether an official SSO endpoint exists for trusted campus applications
3. The exact internal database schema and technology version
4. Whether LPU intends to publish an official developer API for campus integrations
5. Rate limits and terms of service for any official integration

## How to Reproduce Safe/Passive Portions

```bash
# DNS
dig ums.lpu.in A
dig ums.lpu.in CNAME
dig lpu.in NS

# HTTP Headers (no auth)
curl -sI https://ums.lpu.in/
curl -sI https://ums.lpu.in/myclass/

# TLS Certificate
echo | openssl s_client -connect ums.lpu.in:443 -servername ums.lpu.in 2>/dev/null | openssl x509 -noout -subject -issuer -dates

# Public HTML
curl -sL https://ums.lpu.in/ -o index.html
```

## Security Notice

No credentials, session cookies, bearer tokens, or other secrets are stored anywhere in this directory. All header evidence has been manually redacted. The `ASP.NET_SessionId` cookie name is documented (as it is a public framework cookie name) but no values are recorded.

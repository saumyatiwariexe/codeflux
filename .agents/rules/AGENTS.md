#  Paladeium — Agent Rules
> These rules are automatically loaded by any Antigravity agent working on this project.
> **Do NOT delete or modify this file without running the amendment protocol below.**

---

## 0. Project Identity

- **App Name:** Paladeium
- **Tagline:** *"Your Campus. Your Quests. Your People."*
- **Target:** Lovely Professional University (LPU) students
- **Competition Track:** Campus Life & Student Experience
- **Competitor to beat:** Macbease (see `/docs/PROBLEM_VALIDATION.md` for full teardown)

---

## 1. Document Hierarchy (Source of Truth)

Read these files **in order** before making any architectural or feature decision:

| Priority | File | Purpose |
|---|---|---|
| 1 | `/docs/PROBLEM_VALIDATION.md` | Why we build what we build — real pain points |
| 2 | `/docs/PRD.md` | What we build — full feature specifications |
| 3 | `/docs/IMPLEMENTATION_GUIDE.md` | How we build it — tech stack, schemas, AI pipelines |
| 4 | `/docs/AMENDMENTS.md` | Latest changes — **always check this last, it overrides above** |

> [!IMPORTANT]
> If `/docs/AMENDMENTS.md` exists and contains an entry that contradicts PRD.md or IMPLEMENTATION_GUIDE.md, the **AMENDMENT wins**. It represents the team's most recent decision.

---

## 2. Amendment Protocol (CRITICAL)

**When the user proposes ANY change to the plan — a new feature, a removed feature, a tech swap, a priority shift — follow this exact protocol:**

### Step 1 — Understand the Change
Ask clarifying questions if the change is ambiguous. Do NOT implement until the intent is clear.

### Step 2 — Write the Amendment
Append a new entry to `/docs/AMENDMENTS.md` using this exact format:

```
## AMD-[NNN] — [Short Title]
**Date:** YYYY-MM-DD HH:MM IST
**Requested by:** [User / Team]
**Status:** ACTIVE

### What Changed
[Clear description of what is being added, removed, or modified]

### Overrides
- [Filename]:[Section] — "[old text summary]" -> "[new text summary]"

### Rationale
[Why this change was made]

### Impact
- Modules affected: [list]
- Files to update: [list]
- Breaking changes: [yes/no + details]
```

### Step 3 — Update Source Docs
After writing the amendment, **also update the relevant section** in PRD.md or IMPLEMENTATION_GUIDE.md so the docs stay current. Do NOT leave them stale.

### Step 4 — Confirm with User
Tell the user: "Amendment AMD-[NNN] has been logged and source docs updated."

---

## 3. Feature Decision Rules

- **Every new feature must map to a validated pain point** in `PROBLEM_VALIDATION.md`. If it doesn't, add a new problem entry first.
- **No feature can be added to PRD.md without a Problem # reference** in its description.
- Macbease already has: mapping, events, clubs, gamification, social feed, chat, profiles. Our edge is **SquadUp (teammate matching)**, **EduRev Connect**, **LostPulse**, and **GTA5 fog-of-war quest exploration**. Do NOT drop any of these four — they are our differentiators.

---

## 4. Tech Stack Rules

The following are **locked** decisions (require AMD to change):

| Locked Decision | Value |
|---|---|
| Mobile Framework | React Native + Expo |
| Map Library | Mapbox GL (custom vector tiles) |
| Backend Language | Node.js + TypeScript (Fastify) |
| Primary DB | PostgreSQL via Supabase |
| Social/Chat DB | MongoDB Atlas |
| Cache/Realtime | Redis (Upstash) |
| Auth | Firebase Auth (OTP via LPU email) |
| State Management | Zustand (client) + TanStack Query (server) |
| AI Matching | Vector embeddings (complementary skill scoring) |

**Not locked** (can be swapped with good reason, no AMD required):
- UI component library choice
- Specific animation library
- Email provider (nodemailer / SendGrid / Resend)
- Storage provider (R2 / S3)

---

## 5. Coding Standards

- **TypeScript strict mode** on everywhere — no `any` without a comment explaining why
- **File naming:** `kebab-case` for files, `PascalCase` for React components, `camelCase` for functions
- **Component structure:** Props interface -> component -> styles (no inline styles except one-liners)
- **API responses:** Always wrap in `{ success: boolean, data: T | null, error: string | null }`
- **Error handling:** Never swallow errors silently — log + surface to user with friendly message
- **Comments:** Add a JSDoc comment to every exported function. Skip for private helpers < 5 lines.

---

## 6. Design System Rules

- **Adopted Framework:** Stitch Minimalist Social Discovery Platform UI
- **Primary Color:** `#6C63FF` (Electric Violet)
- **Accent Color:** `#43E97B` (Neon Emerald)
- **Font Stack:** `Outfit` (headings) + `Inter` (body) — loaded from Google Fonts
- **Theme:** Support for **both Light and Dark modes** via a Settings toggle.
- **Style:** Apple-minimalist Glassmorphism (frosted glass, ultra-fine borders, deep space canvas `#0B0C14` / `#121324`)
- **No plain borders** — use gradient borders or glassmorphism
- **Every tap must have a micro-animation** (spring scale, opacity pulse, or ripple)
- **No Emojis:** Absolutely no emojis are allowed anywhere in the app UI or documentation.
- **Icons:** All visual iconography must use standard SVG components (e.g., via `@expo/vector-icons`).

---

## 7. Privacy & Safety Rules (Non-Negotiable)

- Location data is **never stored** in the database — only used ephemerally for quest verification server-side
- SquadUp swipe history is **private** — never expose who swiped whom, even to admins
- All DMs are **end-to-end encrypted**
- Student photos/ID scans are **deleted after verification** — never retained
- Every user-generated content feature must have a **report button**

---

## 8. Module Priority (Hackathon Focus Order)

Build in this order — if time runs out, earlier modules are more important:

1. CampusVerse (map) — flagship, must demo
2. SquadUp (swipe matching) — unique differentiator, must demo
3. Profile + Skills — powers matching, must demo
4. EventHub (event pins on map + RSVP) — must demo
5. EduRev Connect (dashboard) — LPU-specific hook, demo if time
6. ClubVerse (directory) — demo if time
7. QuestZone (gamification) — demo if time
8. LostPulse (lost & found) — demo if time
9. PulseChat — lowest hackathon priority (show UI only)

---

## 9. When In Doubt

- Check `AMENDMENTS.md` for the latest decisions
- Ask the user before making any architectural change
- Default to simplicity — a working simple version beats a broken complex one
- If a feature is too complex for the hackathon timeline, scope it down and document the limitation

---

*Auto-loaded by Antigravity IDE for any agent working on this workspace.*
*Last updated: 2026-09-10*

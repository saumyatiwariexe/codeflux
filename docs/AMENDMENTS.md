#  Paladeium — Amendment Log
> This file is the **single source of truth for all plan changes**.
> Every agent must check this file LAST — entries here override PRD.md and IMPLEMENTATION_GUIDE.md.
> Maintained automatically by the amendment protocol in `.agents/rules/AGENTS.md`.

---

## How to Read This File

- **AMD-NNN** = Amendment number (sequential, never reuse)
- **Status: ACTIVE** = This amendment is in effect
- **Status: SUPERSEDED by AMD-NNN** = A later amendment replaced this one
- **Status: REVERTED** = This change was rolled back

---

## AMD-001 — Initial Plan Baseline
**Date:** 2026-09-10 00:30 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
Initial project plan established. This is the baseline all future amendments are measured against.

### Key Decisions Locked
- App name: **Paladeium**
- Core differentiators vs Macbease: SquadUp, EduRev Connect, LostPulse, GTA5 fog-of-war
- Tech stack: React Native + Expo, Mapbox, Fastify, Supabase, MongoDB, Redis, Firebase Auth
- 10 core modules defined in PRD.md
- Hackathon build priority order established

### Source Documents Created
- `/docs/PROBLEM_VALIDATION.md`
- `/docs/PRD.md`
- `/docs/IMPLEMENTATION_GUIDE.md`
- `.agents/rules/AGENTS.md` (this amendment system)
- `.agents/skills/amend-plan/SKILL.md` (amendment skill)

### Rationale
Project kickoff for hackathon submission targeting Campus Life & Student Experience track.

### Impact
- Modules affected: All (baseline)
- Files to update: N/A (initial creation)
- Breaking changes: No

---

<!-- NEW AMENDMENTS GO BELOW THIS LINE — DO NOT EDIT ABOVE -->

## AMD-002 — Adopt Stitch UI & Add Theme Toggle
**Date:** 2026-09-10 01:40 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
Adopted the "Stitch Minimalist Social Discovery Platform" as the primary design system and UI codebase. Added a requirement for a Light/Dark theme toggle accessible from the Profile/Settings area.

### Overrides
- PRD.md:MODULE 10 — "NEW ADDITION" -> "Added Light/Dark theme toggle to Profile/Settings"
- PRD.md:8. Design System — "Original Color Palette" -> "Apple-minimalist glassmorphism based on Stitch UI (Outfit & Inter fonts, deep space canvas)"
- IMPLEMENTATION_GUIDE.md:Part 2 (Design System) — "Original Design System" -> "Adopted Stitch UI CSS/Tokens"

### Rationale
To elevate the visual experience and support user preference with a light/dark mode switch. The Stitch UI provides a ready-made modern aesthetic.

### Impact
- Modules affected: All UI components, Profile module
- Files to update: PRD.md, IMPLEMENTATION_GUIDE.md
- Breaking changes: No

---

## AMD-003 — Global Rename to Paladeium & SVG Enforcement
**Date:** 2026-09-11 00:35 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
Globally renamed the app from "Campus Pulse" to "Paladeium". Also established a strict rule forbidding the use of emojis in the UI or documentation, mandating the use of SVG components (via `@expo/vector-icons`) for all iconography.

### Overrides
- PRD.md:Header — "Campus Pulse" -> "Paladeium"
- AGENTS.md:6. Design System Rules — "NEW ADDITION" -> "Added No Emojis & SVG Icon rules"

### Rationale
Requested by the team to rebrand the application to Paladeium and maintain a professional, minimalist design aesthetic by avoiding native text emojis in favor of scalable vector graphics.

### Impact
- Modules affected: All UI, All Documentation
- Files to update: Globally across the entire project
- Breaking changes: No

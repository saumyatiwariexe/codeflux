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

---

## AMD-004 — Android Studio Build Pipeline, react-native-reanimated Removal, Swipe Gesture Overhaul
**Date:** 2026-09-11 04:00 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
1. **Build system shifted to Android Studio / Gradle native build.** The project no longer uses Expo Go for running on device. All development now uses `expo run:android` (custom dev client) compiled via Gradle. The APK is sideloaded using `adb install --no-verify`.
2. **react-native-reanimated removed entirely.** v3 and v4 both cause C++/ABI native build failures on Windows with the current NDK version. All animations now use React Native's built-in `Animated` API.
3. **SquadUp gesture system rebuilt with PanResponder.** The `SwipeDeck` component uses `PanResponder` + `Animated.ValueXY` — no reanimated dependency.
4. **JDK pinned to 17, NDK pinned to 26.1.10909125.** JDK 25 and NDK 27 cause CMake failures. This is a hard lock.
5. **USB ADB workflow established.** Phone connected via USB. `adb reverse tcp:8081 tcp:8081` must be run before each session to tunnel Metro through USB.
6. **Emoji policy enforced across all UI.** Zero raw Unicode emoji characters in app UI. All iconography uses `@expo/vector-icons` Ionicons.

### Overrides
- IMPLEMENTATION_GUIDE.md:Part 2 (Frontend Libraries) — `react-native-reanimated` REMOVED
- IMPLEMENTATION_GUIDE.md:Part 2 (Hosting) — "Expo Go for demo" -> "Android Studio custom dev client + adb sideload"

### Rationale
Windows-specific build toolchain constraints forced removal of reanimated. PanResponder-based SwipeDeck delivers equivalent swipe physics without the native dependency issue.

### Impact
- Modules affected: SquadUp (SwipeDeck), All UI (emoji policy), Build pipeline
- Files to update: IMPLEMENTATION_GUIDE.md (Parts 2, 3, 7)
- Breaking changes: Any new library with a peer dependency on react-native-reanimated CANNOT be added without resolving the NDK issue first.

---

## AMD-005 — Navigation Architecture: Stack Screens for EduRev, LostPulse, QuestZone
**Date:** 2026-09-11 23:00 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
EduRev Connect and LostPulse are implemented as **stack screens** (not tabs) to keep the 6-tab bottom bar clean:
- **EduRev Connect** (`/edurev`) — accessed via CTA button on the Profile tab.
- **LostPulse** (`/lostfound`) — accessed via button in the Pulse feed header.
- **QuestZone** (`/questzone`) — accessed via "Quests" button in Pulse header and XP card CTA.

### Overrides
- PRD.md:MODULE 6 — "EduRev Connect navigation" -> "Stack screen from Profile tab"
- PRD.md:MODULE 7 — "LostPulse navigation" -> "Stack screen from Pulse feed header"

### Rationale
Bottom tab bar locked at 6 tabs for visual balance. Additional features accessed contextually from the most relevant existing tab.

### Impact
- Modules affected: Navigation (_layout.tsx), Profile tab, Pulse tab
- Files to update: None — already implemented
- Breaking changes: No

---

## AMD-006 — Hinge-Style SquadUp Feed Replacement
**Date:** 2026-09-12 15:45 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
The SquadUp feature's core interaction model is changing. The Tinder-style swipe deck (left/right swiping on whole cards) is being completely removed. It is being replaced with a "Hinge-style" vertical scrolling feed where users interact (like/comment) with specific individual prompts, photos, or bio elements on a user's profile.

### Overrides
- PRD.md:MODULE 2 — "Tinder-style swipe deck" -> "Hinge-style vertical scroll feed with specific prompt interactions"
- IMPLEMENTATION_GUIDE.md:Part 2 — "SwipeDeck component with PanResponder" -> "SquadFeed component with vertical ScrollView"

### Rationale
Requested by the team to allow more intentional, content-driven teammate matching (Hinge style) rather than superficial quick-swiping (Tinder style), which is better suited for finding project/hackathon partners.

### Impact
- Modules affected: SquadUp (MODULE 2)
- Files to update: PRD.md, IMPLEMENTATION_GUIDE.md, app/(tabs)/squadup.tsx
- Breaking changes: Yes — SwipeDeck component will be removed and replaced.


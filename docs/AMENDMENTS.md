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

## AMD-006 — Hackathon Scope Cut: 4 Flagship Modules, QuestZone Merged Into CampusVerse Map
**Date:** 2026-09-11 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
1. **Hackathon build/demo scope narrowed to 4 flagship modules.** Only these are polished, wired to real data, and demoed live:
   - **CampusVerse** (map) — flagship, now the app's spine
   - **SquadUp** (swipe matching)
   - **LostPulse** (lost & found) — items shown as map pins, not just a list
   - **EventHub** — map is now the primary discovery surface; list/calendar view is secondary
2. **QuestZone is no longer a standalone tab/module.** Its Pokémon GO-style quest mechanic is merged directly into CampusVerse: quest markers, XP nodes, and badges spawn on the map based on GPS proximity (invisible until the player is near them, like Pokémon GO spawns) rather than living in a separate quest list screen. Module 3 in PRD.md is retitled "CampusVerse Discovery Layer" and folded under Module 1.
3. **CampusVerse (Module 1) is upgraded beyond fog-of-war-only:**
   - Fog-of-war reveal stays (GTA5-style, permanent per-user map reveal on physical visit)
   - **NEW — Proximity Spawns (Pokémon GO mechanic):** quests, XP nodes, lost-item pins, and event pins are hidden until the student is within GPS radius, then animate onto the map ("spawn")
   - **NEW — GTA5-style world state:** Zone Territories (already spec'd in 1.3) now persist discovery/ownership state per player (e.g., "% explored" per territory) and show live activity blips (nearby SquadUp matches, active events) the way GTA5 shows other players/mission markers on the minimap
   - SquadUp integration: nearby matches appear as blips on the map (new — connects Module 1 and Module 2)
4. **Deprioritized for hackathon demo (kept in code/schema, not polished or pitched):** ClubVerse, EduRev Connect, PulseChat, Social Layer/Feed. These remain as stack screens per AMD-005 but are explicitly "demo if time" at the bottom of build priority.
5. **Rule confirmed, not re-created:** the existing Amendment Protocol (`.agents/rules/AGENTS.md` §2) already requires any system/architecture change to be logged here and reflected in source docs — this entry follows that existing rule rather than introducing a new one.

### Overrides
- PRD.md:MODULE 1 (CampusVerse) — "Fog-of-war + event pins" -> "Fog-of-war + Pokémon-GO-style proximity spawns + GTA5-style persistent zone/blip state"
- PRD.md:MODULE 3 (QuestZone) — "Standalone module/tab" -> "Merged into CampusVerse as the Discovery Layer; no separate QuestZone screen"
- AGENTS.md:§8 Module Priority — reordered to reflect the 4-module hackathon scope (see updated table)

### Rationale
Round 1 eval feedback: 8 parallel modules diluted the demo and gave no single memorable moment; "AI" and backend were mock-only with no flagship technical depth anywhere. Consolidating Quests into the map turns CampusVerse into a genuinely more technically complex, demo-able centerpiece (real proximity/geofence logic, persistent state) instead of adding an 9th shallow screen — directly answers the judge question "which of these are you actually submitting."

### Impact
- Modules affected: CampusVerse (major expansion), QuestZone (removed as standalone, merged), SquadUp (map integration), LostPulse (map pins), EventHub (map-first), ClubVerse/EduRev/PulseChat/Social (deprioritized only, not removed)
- Files to update: PRD.md (Module 1, Module 3, Navigation Architecture, Phased Rollout), AGENTS.md (§3 differentiators, §8 build priority)
- Breaking changes: `questzone.tsx` route and `quest/index.tsx` screen become secondary/removable from nav; their logic (quest list, XP) should be surfaced as map overlays instead. Not a data-model breaking change — `quests`/`quest_progress` tables are reused, just rendered differently.

---

## AMD-007 — Restore EduRev Connect as Flagship Module, Wired to Quest System
**Date:** 2026-09-11 IST
**Requested by:** Team
**Status:** ACTIVE

### What Changed
EduRev Connect is restored to flagship/must-demo status (it had been deprioritized in AMD-006). Web research confirmed EduRevolution is a real, currently-active official LPU academic policy (in effect since Spring Term 2024-25), not a fictional hook — key components:
- **Course Equivalence & Attendance Relaxation** — students can request attendance/course relaxation for a term in lieu of NPTEL/MOOC courses or certifications completed
- **Grade Revision and Overall Welfare (GROW)**
- **10% attendance waiver** for pre-final/final year students; up to 10% attendance shortage condonable based on prior-term record; 5% relaxation for medical/genuine exigencies

This is a real, high-stakes, grade/attendance-affecting policy — making it a genuine "must-have" hook rather than a convenience feature, and it directly strengthens the Problem-Solution Fit weakness flagged in the Round 1 eval.

**Integration with the quest system (per user request):** EduRev Connect is now explicitly wired to CampusVerse's Discovery Layer (quests, merged in AMD-006), not a disconnected dashboard:
- Quest completions that map to real EduRev-eligible activity (e.g., "Get a certification on NPTEL/SWAYAM," "Attend 3 workshops," "Win a competition" — PRD.md §3.1) auto-generate EduRev submission evidence instead of requiring manual form-fill (this was already spec'd in PRD.md Module 6.4 "Quest Integration" — it was just deprioritized in AMD-006; AMD-007 restores it to priority)
- The EduRev Benefit Calculator (Module 6.2) reads directly from a student's quest/XP history rather than a separate manual achievement log, so CampusVerse exploration and EduRev progress are the same underlying data
- CampusVerse map can surface an EduRev-eligible quest distinctly (e.g., a "counts toward EduRev" badge on relevant quest spawns) so students see the real-world stake while exploring

### Overrides
- AGENTS.md:§3 differentiators — "SquadUp, LostPulse, CampusVerse discovery" -> "SquadUp, LostPulse, CampusVerse discovery, **EduRev Connect**" (4 differentiators, restored)
- AGENTS.md:§8 Module Priority — EduRev Connect moved from priority 6 ("demo if time") to priority 2 (must-demo, right after CampusVerse)
- PRD.md:MODULE 6 — "EduRev Connect (dashboard)" -> "EduRev Connect, data-fed by CampusVerse quest completions (Module 6.4 Quest Integration promoted from optional to core)"

### Rationale
User confirmed EduRev is a real, current LPU program students genuinely care about (grades/attendance are non-negotiable stakes, unlike clubs/events which have easy WhatsApp-group workarounds per the Round 1 eval's alternative-analysis). Tying it directly to the quest/map system also gives CampusVerse's Discovery Layer a real-world payoff beyond cosmetic XP, which strengthens both Technical Complexity (real data pipeline: quest completion -> EduRev evidence) and Problem-Solution Fit scores from the Round 1 evaluation.

### Impact
- Modules affected: EduRev Connect (priority restored), CampusVerse (quest spawns now carry EduRev-eligibility metadata), Module 6.4 (promoted from optional to core requirement)
- Files to update: PRD.md (Module 6, Module 1 discovery layer note), AGENTS.md (§3, §8)
- Breaking changes: None — `edurev_achievements` table already exists in schema (per earlier Explore report); this connects existing quest data to it rather than requiring new tables.

---

<<<<<<< Updated upstream
## AMD-008 — Auth Provider Swap: Firebase Auth → Clerk (Google OAuth + Email/Password)
**Date:** 2026-09-12 00:10 IST
=======
## AMD-008 — Replace Firebase Auth with Clerk OAuth; Add Supabase Client + File Uploads
**Date:** 2026-09-12 00:44 IST
>>>>>>> Stashed changes
**Requested by:** Team
**Status:** ACTIVE

### What Changed
<<<<<<< Updated upstream
Firebase Auth is removed entirely. Clerk replaces it as the sole authentication provider, supporting:
- **Google OAuth** (one-tap sign-in)
- **Email/Password** (standard Clerk flow)
- No LPU-email restriction — any email is now allowed

The app no longer restricts login to `@lpu.in` addresses.

### Overrides
- AGENTS.md:§4 Tech Stack — "Auth: Firebase Auth (OTP via LPU email)" → "Auth: Clerk (Google OAuth + Email/Password)"
- IMPLEMENTATION_GUIDE.md:Part 2 (Auth) — "Firebase Admin SDK" → "Clerk JWKS verification via @clerk/backend"
- packages/api/.env.example — Firebase env vars removed, Clerk env vars added

### Rationale
Clerk provides a vastly simpler developer experience: prebuilt React Native auth flows, Google OAuth with one-tap, and JWT JWKS verification without maintaining a Firebase project and service account. Removing the LPU-email restriction opens the app to broader testing during the hackathon.

### Impact
- Modules affected: Auth flow, API auth middleware (lib/auth.ts), mobile useAuthStore
- Files to update: packages/api/src/lib/auth.ts, packages/api/.env.example, apps/mobile package.json, apps/mobile/stores/useAuthStore.ts
- Breaking changes: firebase-admin removed from API; mobile apps no longer need Firebase SDK
=======
1. **Auth provider swapped from Firebase Auth (LPU email OTP) to Clerk OAuth.** The `lpu-verify.tsx` screen and LPU-email-only gate are removed. Students now sign in via Google or GitHub OAuth using `@clerk/clerk-expo`. Clerk manages session tokens — Zustand's `useAuthStore` is simplified to hold only the UI-facing user profile, not raw tokens.
2. **Supabase JS client added to the mobile app.** `services/supabase.ts` initializes `@supabase/supabase-js` with AsyncStorage session persistence. Supabase RLS policies updated to key off the Clerk JWT (`auth.jwt() ->> 'sub'` = Clerk `userId`) instead of `firebase_uid`.
3. **File upload support added via Supabase Storage.** `services/storage.ts` wraps the Supabase Storage client with typed helpers for three buckets: `avatars`, `lostfound`, and `edurev`. `expo-image-picker` added for camera-roll access.
4. **New Supabase migration `005_clerk_auth_storage.sql` generated.** Alters the `users` table: renames `firebase_uid` to `clerk_user_id`, creates the three Storage buckets, and updates all RLS policies to use the Clerk subject claim.

### Overrides
- IMPLEMENTATION_GUIDE.md:Part 2 (Frontend Libraries) — Firebase Auth client removed -> `@clerk/clerk-expo` + `@supabase/supabase-js` + `expo-image-picker` + `expo-web-browser` + `expo-secure-store` added
- IMPLEMENTATION_GUIDE.md:Part 2 (Locked Decisions) — Auth row: "Firebase Auth (OTP via LPU email)" -> "Clerk OAuth (Google + GitHub)"
- IMPLEMENTATION_GUIDE.md:Part 5 (API Contract, Auth endpoints) — OTP endpoints removed -> Clerk webhook endpoints noted
- AGENTS.md:Section 4 Locked Table — Auth row updated to Clerk

### Rationale
Firebase Auth OTP requires a working email relay and LPU SMTP integration to demo, which is a dependency risk for the hackathon deadline. Clerk OAuth (Google/GitHub) works out of the box with zero backend setup, lets us demo auth end-to-end immediately, and is more familiar to the student audience. Supabase was already the planned primary DB (AMD-001); this simply connects the mobile client directly rather than waiting for the Fastify proxy.

### Impact
- Modules affected: Auth Flow, Profile, EduRev Connect (file upload for certificates), LostPulse (item photo upload)
- Files to update: IMPLEMENTATION_GUIDE.md (Parts 2, 5), AGENTS.md (Section 4)
- Breaking changes: Yes — `firebase_uid` column renamed to `clerk_user_id` in existing `users` table migration. All RLS policies rewritten to match Clerk JWT structure. Run migration 005 to apply.

>>>>>>> Stashed changes

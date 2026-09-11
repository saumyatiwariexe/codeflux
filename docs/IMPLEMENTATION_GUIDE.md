#  Agent Rules & Implementation Guide
## Paladeium — Development Playbook
**Document Version:** 2.0 | **Date:** September 2026 | **See AMENDMENTS.md for all overrides**

---

## Part 1 — Philosophy & Agent Rules

### Rule 1: Problem First, Feature Second
Every line of code must trace back to a validated pain point in the Problem Validation document.
- If someone proposes a feature that doesn't map to a real student problem → **reject it or deprioritize**
- New features require: (a) who benefits, (b) how many, (c) what's the alternative today?

### Rule 2: Mobile-First, Always
This is a campus app used on the go, in hallways, between classes.
- Design for thumb-reach zones on a 6" screen
- Every key action must be reachable in 3 taps or fewer
- Offline-first: All critical features (map navigation, QR tickets) must work without internet
- Optimize for 100MB total app size — students on limited data plans

### Rule 3: Trust is Non-Negotiable
Students will share personal information (skill level, hostel block, availability).
- All messaging gated behind mutual match OR same club membership
- No location shared publicly — only used server-side for quest verification
- No external party gets student data
- GDPR-equivalent privacy controls for international students

### Rule 4: Gamification Must Be Meaningful
Points and badges must connect to real outcomes.
- Every XP milestone must unlock a real benefit (not just a virtual trophy)
- EduRevolution sync ensures quests have academic weight
- Avoid dark patterns — no manipulative streak penalties

### Rule 5: The Map is Sacred
The CampusVerse map is the flagship feature. It must be:
- Beautiful (GTA 5 aesthetic with campus accuracy)
- Fast (< 2s load time, even on 4G)
- Accurate (GPS drift handled gracefully, 50m radius for quest completion)
- Updated (admin panel to add/update buildings and points of interest)

### Rule 6: Inclusivity by Default
- Hindi + English bilingual UI (toggleable)
- Color-blind safe palette (tested with Deuteranopia and Protanopia filters)
- Screen reader accessible (WCAG 2.1 AA)
- International student mode (simplified navigation terminology)
- Light / Dark Theme toggle accessible from Profile -> Settings

---

## Part 2 — Technology Stack (Current Locked Decisions)

> [!IMPORTANT]
> This section reflects the **actual installed and working stack** as of AMD-004.
> See AMENDMENTS.md for rationale on any deviation from the original PRD stack.

### Frontend — React Native (Expo Bare Workflow)

**Build Method:** Android Studio Gradle native build via `expo run:android`.
**NOT using Expo Go** — the app requires native modules (Mapbox) that are incompatible with Expo Go.

**Installed & Working Libraries:**

| Library | Version | Purpose |
|---|---|---|
| `expo` | ~57.0.21 | Core Expo SDK |
| `expo-router` | ~57.0.20 | File-based navigation |
| `@rnmapbox/maps` | ^10.3.5 | CampusVerse map (Mapbox GL) |
| `react-native-gesture-handler` | ~2.32.0 | Touch routing (NOT used for swipe animation) |
| `react-native-screens` | ~4.26.0 | Native screen optimization |
| `react-native-safe-area-context` | ~5.7.0 | Safe area insets |
| `zustand` | ^5.0.15 | Global client state management |
| `@expo/vector-icons` | ^15.1.1 | All app iconography (Ionicons) |
| `@expo-google-fonts/inter` | ^0.2.3 | Body font |
| `@expo-google-fonts/outfit` | ^0.2.3 | Heading font |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistent local storage (auth session) |
| `expo-constants` | ~57.0.17 | App config, env access |
| `expo-haptics` | ~57.0.2 | Tap haptic feedback |
| `expo-font` | ~57.0.3 | Font loading |

**Removed Libraries (AMD-004):**

| Library | Reason Removed |
|---|---|
| `react-native-reanimated` | C++/ABI native build failure on Windows with NDK 26. Use React Native `Animated` API instead. |

**Not Yet Installed (Planned):**

| Library | Purpose | When |
|---|---|---|
| `@tanstack/react-query` | Server state / API cache | When backend API is wired |
| `expo-location` | GPS for quest verification | When QuestZone goes live |
| `expo-notifications` | Push notifications | Phase 2 |
| `expo-camera` | QR scanner for event check-in | Phase 2 |
| `socket.io-client` | Real-time PulseChat | Phase 2 |

### Backend — Node.js + TypeScript (Fastify)

**Status:** Scaffolded in `packages/api/`. Not yet connected to the mobile app.
The mobile app currently runs entirely on local mock data.

| Package | Purpose |
|---|---|
| `fastify` | High-performance HTTP server |
| `prisma` | ORM for PostgreSQL (schema drafted) |
| `firebase-admin` | Auth token verification + push notifications |
| `@anthropic-ai/sdk` | AI matching & EduRev classification |
| `sharp` | Image processing for Lost & Found |
| `nodemailer` | Automated event emails |
| `qrcode` | QR ticket generation |

### Build Toolchain (Locked by AMD-004)

| Tool | Version | Notes |
|---|---|---|
| JDK | 17 (Temurin) | **HARD LOCK** — JDK 25 breaks CMake |
| Android NDK | 26.1.10909125 | **HARD LOCK** — NDK 27 breaks CMake |
| Android SDK | 35 | Target SDK |
| Gradle | 9.3.1 | Managed by Expo |
| CMake | 3.22.1 | For native modules |

### Database Strategy (Planned — Not Yet Connected)

```
PostgreSQL (Supabase hosted)
├── Users & Authentication
├── Profiles & Skills
├── Events & Tickets
├── Clubs & Memberships
├── EduRevolution Records
├── Lost & Found Items
└── Quest Progress

MongoDB (Atlas)
├── Social Feed Posts
├── Chat Messages
├── Stories
├── Activity Logs
└── Match History

Redis (Upstash)
├── Online presence
├── Match queue
├── Quest XP cache
├── Rate limiting
└── Session tokens
```

### Maps — Mapbox

**Status:** Token configured in `android/app/src/main/res/values/strings.xml`. Map renders on device.

**Token location:** `strings.xml` → `<string name="mapbox_access_token">YOUR_TOKEN</string>`

**Planned Custom Data:**
- LPU campus boundary: GeoJSON polygon
- Building footprints: GeoJSON per block
- Zone territories: Colored polygon overlays
- Points of interest: GeoJSON with metadata

### Device Connection Workflow (AMD-004)

```
Each dev session — run in order:
1.  Connect phone via USB cable
2.  adb reverse tcp:8081 tcp:8081   ← tunnels Metro to phone
3.  Start Metro:  npx expo start --port 8081
4.  Build+push:   expo run:android
    OR push existing APK:
    adb install --no-verify app-debug.apk
```

### Hosting & DevOps

| Service | Hackathon Use |
|---|---|
| Android Studio | Local Gradle build for custom dev client APK |
| `adb install --no-verify` | Sideload APK to physical phone |
| Railway.app | Backend API (when ready) |
| Supabase | PostgreSQL (free tier) |
| MongoDB Atlas | Social/chat data (free tier) |
| Upstash | Redis (free tier) |
| GitHub Actions | CI/CD pipeline |

---

## Part 3 — Actual Codebase Structure (Current State)

```
codeflux/
├── apps/
│   └── mobile/                          # React Native Expo app (ACTIVE)
│       ├── app/                         # Expo Router file-based pages
│       │   ├── _layout.tsx              # Root layout + auth guard
│       │   ├── (auth)/                  # Auth stack screens
│       │   │   ├── welcome.tsx          # Landing / onboarding
│       │   │   ├── login.tsx            # Email + OTP login
│       │   │   └── signup.tsx           # New user registration
│       │   ├── (tabs)/                  # 6-tab bottom navigation
│       │   │   ├── _layout.tsx          # Tab bar config (Ionicons, no emojis)
│       │   │   ├── index.tsx            # Pulse — home feed + stories
│       │   │   ├── campusverse.tsx      # CampusVerse — Mapbox map
│       │   │   ├── squadup.tsx          # SquadUp — swipe deck
│       │   │   ├── eventhub.tsx         # EventHub — event listings
│       │   │   ├── clubverse.tsx        # ClubVerse — club directory
│       │   │   └── profile.tsx          # Profile — user stats + settings
│       │   ├── questzone.tsx            # QuestZone (stack screen from Pulse)
│       │   ├── edurev/                  # EduRev Connect (stack from Profile)
│       │   ├── lostfound/               # LostPulse (stack from Pulse)
│       │   ├── event/                   # Event detail screen
│       │   ├── quest/                   # Quest detail screen
│       │   └── pulsechat/               # PulseChat (UI only)
│       ├── components/
│       │   ├── ui/                      # Design system primitives
│       │   │   ├── Text.tsx             # Typography with variants
│       │   │   ├── Card.tsx             # Glassmorphic card
│       │   │   ├── Button.tsx           # Primary/secondary buttons
│       │   │   ├── Badge.tsx            # Status/XP/squad badges
│       │   │   ├── Avatar.tsx           # User avatar with online dot
│       │   │   └── XPBar.tsx            # XP progress bar
│       │   ├── map/
│       │   │   ├── MapCanvas.tsx        # Mapbox wrapper
│       │   │   └── EventPins.tsx        # Event location markers
│       │   ├── squad/
│       │   │   ├── SwipeCard.tsx        # Hinge-style profile card
│       │   │   └── SwipeDeck.tsx        # PanResponder swipe engine
│       │   └── profile/
│       │       ├── SkillTag.tsx         # Skill chip component
│       │       └── AchievementBadge.tsx # Badge display component
│       ├── stores/
│       │   ├── useAuthStore.ts          # Auth state (Zustand + AsyncStorage)
│       │   └── useThemeStore.ts         # Dark/light theme toggle
│       ├── services/
│       │   └── api.ts                   # API service layer (stub — not wired)
│       ├── constants/
│       │   └── theme.ts                 # Design tokens (colors, spacing)
│       └── android/                     # Android native project
│           └── app/src/main/res/values/
│               └── strings.xml          # Mapbox token lives here
│
├── packages/
│   └── api/                             # Fastify backend (scaffolded, not connected)
│       ├── src/
│       │   ├── routes/                  # API route handlers
│       │   ├── services/                # Business logic
│       │   └── models/                  # Prisma + Mongoose models
│       └── .env.example                 # Required env vars
│
├── docs/
│   ├── PROBLEM_VALIDATION.md            # Why we build what we build
│   ├── PRD.md                           # What we build
│   ├── IMPLEMENTATION_GUIDE.md          # This file — How we build it
│   └── AMENDMENTS.md                    # Latest decisions (ALWAYS read last)
│
└── .agents/
    ├── rules/AGENTS.md                  # Agent behavioral rules
    └── skills/amend-plan/SKILL.md       # Amendment protocol skill
```

---

## Part 4 — Database Schema (Core Tables)

> These schemas are planned for Supabase PostgreSQL. Not yet applied to a live database.

### Users & Profiles
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lpu_email TEXT UNIQUE NOT NULL,
  phone TEXT,
  firebase_uid TEXT UNIQUE,
  is_id_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  department TEXT,
  year INTEGER,
  degree_level TEXT,
  hostel_block TEXT,
  is_day_scholar BOOLEAN DEFAULT false,
  campus_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  squad_visibility TEXT DEFAULT 'all',
  onboarding_complete BOOLEAN DEFAULT false
);

CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  icon TEXT
);

CREATE TABLE profile_skills (
  profile_id UUID REFERENCES profiles(id),
  skill_id UUID REFERENCES skills(id),
  proficiency TEXT DEFAULT 'intermediate',
  PRIMARY KEY (profile_id, skill_id)
);
```

### SquadUp Engine
```sql
CREATE TABLE squad_swipes (
  id UUID PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id),
  swiped_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,           -- 'like' | 'pass'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE squad_matches (
  id UUID PRIMARY KEY,
  user_a UUID REFERENCES profiles(id),
  user_b UUID REFERENCES profiles(id),
  matched_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'matched'
);

CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT,
  creator_id UUID REFERENCES profiles(id),
  max_members INTEGER DEFAULT 5,
  status TEXT DEFAULT 'forming',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Events & Ticketing
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  organizer_id UUID,
  organizer_type TEXT,
  location_name TEXT,
  location_coords JSONB,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  category TEXT,
  max_attendees INTEGER,
  poster_url TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  holder_id UUID REFERENCES profiles(id),
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMP DEFAULT NOW()
);
```

### Quests & Gamification
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  xp_reward INTEGER NOT NULL,
  location_required BOOLEAN DEFAULT false,
  target_location JSONB,
  completion_criteria JSONB,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE quest_progress (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  quest_id UUID REFERENCES quests(id),
  status TEXT DEFAULT 'in_progress',
  progress_data JSONB,
  completed_at TIMESTAMP,
  xp_awarded INTEGER,
  UNIQUE(profile_id, quest_id)
);
```

---

## Part 5 — API Contract (Key Endpoints)

### Authentication
```
POST /api/v1/auth/send-otp       → Send OTP to LPU email
POST /api/v1/auth/verify-otp     → Verify OTP, return JWT
POST /api/v1/auth/refresh        → Refresh access token
DELETE /api/v1/auth/logout       → Invalidate token
```

### SquadUp
```
GET  /api/v1/squad/deck          → Get paginated swipe deck (AI-ranked)
POST /api/v1/squad/swipe         → Record swipe {targetId, action}
GET  /api/v1/squad/matches       → Get all mutual matches
POST /api/v1/squad/team          → Create team from matches
```

### Events
```
GET  /api/v1/events              → List events (filter: lat/lng, category, date)
POST /api/v1/events              → Create event (club_admin only)
GET  /api/v1/events/:id          → Event detail
POST /api/v1/events/:id/rsvp     → RSVP
POST /api/v1/events/:id/checkin  → Verify QR (organizer)
```

### Quests
```
GET  /api/v1/quests              → Active quests for user
POST /api/v1/quests/:id/verify   → Submit location proof
GET  /api/v1/quests/leaderboard  → Campus XP leaderboard
```

### EduRevolution
```
POST /api/v1/edurev/achievement  → Log new achievement (AI-classifies)
GET  /api/v1/edurev/benefits     → Calculate eligible benefits
POST /api/v1/edurev/submit       → Submit to official portal
GET  /api/v1/edurev/history      → All submissions + status
```

### Lost & Found
```
POST /api/v1/lostfound/lost      → Report lost item
POST /api/v1/lostfound/found     → Report found item
GET  /api/v1/lostfound/matches   → AI-suggested matches for my lost items
POST /api/v1/lostfound/:id/claim → Claim a found item
```

---

## Part 6 — Current Build Status (Updated September 2026)

### Feature Completion

| Module | UI Status | Backend | Notes |
|---|---|---|---|
| Auth Flow | Complete (screens built) | Stub only | Firebase OTP not wired |
| CampusVerse Map | Rendering | N/A | Mapbox token active, no live pins yet |
| SquadUp | 100% complete | Stub only | PanResponder swipe deck, match modal |
| Profile + Skills | 100% complete | Stub only | Mock data |
| EventHub | 100% complete | Stub only | Ionicons, no emojis |
| ClubVerse | 100% complete | Stub only | Ionicons, no emojis |
| QuestZone | 100% complete | Stub only | XP bar, active/completed quests |
| EduRev Connect | Scaffolded | Stub only | Directory exists at `/edurev` |
| LostPulse | Scaffolded | Stub only | Directory exists at `/lostfound` |
| PulseChat | UI stub only | Not started | Lowest priority |

### Immediate Next Steps (Priority Order)

1. **EduRev Connect + LostPulse UI** — Build the actual screens in `/edurev` and `/lostfound` directories
2. **Firebase Auth wiring** — Connect `useAuthStore` to real Firebase OTP flow
3. **Supabase backend connection** — Wire TanStack Query to Fastify API for real data
4. **Fog-of-war map layer** — Add Mapbox fill layer for campus discovery mechanic

---

## Part 7 — Security & Privacy Rules

### Data Minimization
- Collect only what's needed — no optional-but-desired fields
- Location: Only collected during quest verification, never stored persistently
- Student ID photos: Deleted after verification

### Matching Privacy
- A student's swipe history is **never visible** to anyone, including admins
- Rejected profiles don't know they were rejected
- Match is only revealed when **both** parties swipe right

### Content Moderation
- Report button on every post, profile, and chat message
- Strike system: 3 reports → temporary suspension → admin review

---

## Part 8 — Definition of Done (Per Feature)

A feature is "Done" when:
1. Core user flow works end-to-end on Android
2. Error states handled (network error, empty state, loading state)
3. No raw Unicode emojis — all icons use Ionicons via `@expo/vector-icons`
4. Accessibility: labels added for screen readers
5. TypeScript strict mode — no untyped `any` without comment

---

*Document Version 2.0 — Updated by AMD-004 and AMD-005*
*Team: Paladeium | University: Lovely Professional University*
*Last updated: 2026-09-11 23:00 IST*

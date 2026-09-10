#  Agent Rules & Implementation Guide
## Paladeium — Development Playbook
**Document Version:** 1.0 | **Date:** September 2026

---

## Part 1 — Philosophy & Agent Rules

### Rule 1: Problem First, Feature Second
Every line of code must trace back to a validated pain point in the Problem Validation document.
- If someone proposes a feature that doesn't map to a real student problem → **reject it or deprioritize**
- New features require: (a) who benefits, (b) how many, (c) what's the alternative today?

### Rule 2: Mobile-First, Always
This is a campus app used on the go, in hallways, between classes.
- Design for thumb-reach zones on a 6" screen
- Every key action must be reachable in ≤ 3 taps
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
- Avoid "dark patterns" — no manipulative streak penalties

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
- Light / Dark Theme toggle accessible from Profile -> Settings for visual preference and accessibility.

---

## Part 2 — Technology Stack (Final Decisions + Rationale)

### Frontend — React Native (Expo)
**Why:** Single codebase for iOS and Android. Expo Router for file-based navigation. Fast iteration for hackathon.

**Key Libraries:**
| Library | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `react-native-maps` + Mapbox | CampusVerse map |
| `react-native-gesture-handler` | Swipe gestures for SquadUp |
| `react-native-reanimated` | Fog-of-war animations, card physics |
| `react-native-vision-camera` | QR scanner for event check-in |
| `react-native-barcode-builder` | QR ticket generation |
| `expo-location` | GPS for quest verification |
| `expo-notifications` | Push notifications |
| `react-query` / `tanstack-query` | API state management |
| `zustand` | Global client state |
| `react-native-mmkv` | Fast local storage |
| `socket.io-client` | Real-time chat |

### Backend — Node.js + TypeScript
**Why:** JavaScript ecosystem consistency, strong typing, fast to build

**Architecture:** Monorepo with microservices-ready structure

**Key Packages:**
| Package | Purpose |
|---|---|
| `fastify` | High-performance HTTP server |
| `prisma` | ORM for PostgreSQL |
| `mongodb` | Social feed, chat messages |
| `redis` | Caching, pub/sub for real-time |
| `socket.io` | WebSocket server for chat |
| `bullmq` | Background job queues |
| `firebase-admin` | Auth + push notifications |
| `sharp` | Image processing for Lost & Found |
| `nodemailer` | Automated event emails |
| `qrcode` | QR code generation |
| `@anthropic-ai/sdk` | AI-powered matching & quest suggestions |

### Database Strategy
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

### Maps — Mapbox + Custom Tiles
**Why Mapbox over Google Maps:** Custom vector tile styling to achieve the GTA 5 aesthetic. Full control over fog-of-war rendering. Offline tile caching. Campus-accurate custom GeoJSON layers.

**Custom Data:**
- LPU campus boundary: GeoJSON polygon
- Building footprints: GeoJSON features per block
- Zone territories: Colored polygon overlays
- Points of interest: GeoJSON point features with metadata

### AI/ML Stack
| Component | Technology |
|---|---|
| Skill matching | Vector embeddings (OpenAI text-embedding-3-small) + cosine similarity |
| Lost & Found vision | CLIP (OpenAI) image similarity + object detection |
| Feed ranking | Weighted scoring algorithm (engagement rate, recency, relevance) |
| Quest personalization | Multi-armed bandit (ε-greedy) for quest recommendation |
| EduRev auto-categorization | LLM-assisted achievement classification |

### Hosting & DevOps (Hackathon Setup)
- **Frontend:** Expo Go for demo, EAS Build for production APK
- **Backend:** Railway.app (free tier for hackathon)
- **Database:** Supabase (free) + MongoDB Atlas (free) + Upstash Redis (free)
- **Storage:** Cloudflare R2 (image uploads, affordable)
- **CI/CD:** GitHub Actions

---

## Part 3 — Codebase Architecture

```
campus-pulse/
├── apps/
│   ├── mobile/                    # React Native Expo app
│   │   ├── app/                   # Expo Router pages
│   │   │   ├── (auth)/            # Onboarding & login
│   │   │   ├── (tabs)/            # Bottom tab screens
│   │   │   │   ├── home/          # Feed, stories
│   │   │   │   ├── map/           # CampusVerse
│   │   │   │   ├── squad/         # SquadUp swipe
│   │   │   │   ├── clubs/         # ClubVerse
│   │   │   │   └── me/            # Profile
│   │   │   ├── event/[id]/        # Event detail
│   │   │   ├── club/[id]/         # Club detail
│   │   │   ├── profile/[id]/      # Public profile
│   │   │   ├── chat/[roomId]/     # Chat screen
│   │   │   ├── quest/             # Quest board
│   │   │   └── edurev/            # EduRevolution
│   │   ├── components/
│   │   │   ├── map/               # MapCanvas, ZonePins, EventPins
│   │   │   ├── squad/             # SwipeCard, MatchCard
│   │   │   ├── event/             # EventCard, TicketPass
│   │   │   ├── club/              # ClubCard, RecruitCard
│   │   │   ├── quest/             # QuestCard, XPBar
│   │   │   ├── profile/           # AchievementBadge, SkillTag
│   │   │   ├── chat/              # MessageBubble, RoomList
│   │   │   └── ui/                # Design system components
│   │   ├── hooks/
│   │   ├── stores/                # Zustand stores
│   │   ├── services/              # API service layer
│   │   ├── utils/
│   │   └── constants/
│   │
│   └── web-admin/                 # Next.js admin dashboards
│       ├── club-dashboard/        # Club analytics
│       ├── event-dashboard/       # QR verification
│       ├── edurev-dashboard/      # Achievement approvals
│       └── lost-found-admin/      # Item moderation
│
├── packages/
│   ├── api/                       # Fastify backend
│   │   ├── routes/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── map/
│   │   │   ├── squad/             # Matching engine
│   │   │   ├── events/
│   │   │   ├── clubs/
│   │   │   ├── quests/
│   │   │   ├── edurev/
│   │   │   ├── lostfound/
│   │   │   └── chat/
│   │   ├── services/              # Business logic
│   │   ├── models/                # Prisma + Mongoose
│   │   ├── jobs/                  # BullMQ workers
│   │   └── ai/                    # ML pipeline
│   │
│   ├── shared/                    # Shared types/utils
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── schemas/               # Zod validation schemas
│   │   └── constants/
│   │
│   └── map-tiles/                 # GeoJSON data for LPU campus
│       ├── campus-boundary.geojson
│       ├── buildings.geojson
│       ├── zones.geojson
│       ├── poi.geojson             # Points of interest
│       └── quest-locations.geojson
│
└── infra/
    ├── docker-compose.yml
    ├── railway.toml
    └── .github/workflows/
```

---

## Part 4 — Database Schema (Core Tables)

### Users & Profiles
```sql
-- Users (authentication layer)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lpu_email TEXT UNIQUE NOT NULL,
  phone TEXT,
  firebase_uid TEXT UNIQUE,
  is_id_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  deactivation_date TIMESTAMP,    -- 29-day grace period
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles (public-facing)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  handle TEXT UNIQUE NOT NULL,    -- @username
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  department TEXT,                -- CSE, ECE, MBA...
  year INTEGER,                   -- 1, 2, 3, 4
  degree_level TEXT,              -- UG, PG, PhD
  stream TEXT,
  pronouns TEXT,
  hostel_block TEXT,
  is_day_scholar BOOLEAN DEFAULT false,
  campus_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  squad_visibility TEXT DEFAULT 'all',  -- all | dept | off
  onboarding_complete BOOLEAN DEFAULT false
);

-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,      -- "Machine Learning", "React"
  category TEXT,                  -- "Tech", "Design", "Business"
  icon TEXT
);

CREATE TABLE profile_skills (
  profile_id UUID REFERENCES profiles(id),
  skill_id UUID REFERENCES skills(id),
  proficiency TEXT DEFAULT 'intermediate',  -- beginner|intermediate|expert
  PRIMARY KEY (profile_id, skill_id)
);
```

### SquadUp Engine
```sql
-- Swipe actions (drives the matching algorithm)
CREATE TABLE squad_swipes (
  id UUID PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id),
  swiped_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,           -- 'like' | 'pass' | 'super'
  context TEXT,                   -- 'hackathon' | 'project' | 'general'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches (mutual likes)
CREATE TABLE squad_matches (
  id UUID PRIMARY KEY,
  user_a UUID REFERENCES profiles(id),
  user_b UUID REFERENCES profiles(id),
  matched_at TIMESTAMP DEFAULT NOW(),
  team_id UUID REFERENCES teams(id),  -- NULL until they form a team
  status TEXT DEFAULT 'matched'        -- matched | teamed | archived
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,                      -- "HackLPU 2026", "Startup project"
  competition_id UUID REFERENCES events(id),
  creator_id UUID REFERENCES profiles(id),
  max_members INTEGER DEFAULT 5,
  status TEXT DEFAULT 'forming',  -- forming | complete | competing | archived
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id),
  profile_id UUID REFERENCES profiles(id),
  role TEXT,                      -- "Backend Dev", "UI Designer"
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (team_id, profile_id)
);
```

### Events & Ticketing
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  organizer_id UUID,              -- club_id or user_id
  organizer_type TEXT,            -- 'club' | 'user' | 'admin'
  location_name TEXT,
  location_coords JSONB,          -- {lat, lng}
  block_reference TEXT,           -- "Block G, Room 201"
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  category TEXT,                  -- hackathon | workshop | cultural | sports
  max_attendees INTEGER,
  registration_deadline TIMESTAMP,
  poster_url TEXT,
  status TEXT DEFAULT 'upcoming', -- upcoming | active | completed | cancelled
  is_team_event BOOLEAN DEFAULT false,
  min_team_size INTEGER,
  max_team_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_tiers (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,             -- "General" | "Silver" | "VIP"
  price DECIMAL(10,2) DEFAULT 0,
  quantity INTEGER,
  perks JSONB,                    -- ["Front row", "Backstage pass"]
  sold_count INTEGER DEFAULT 0
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  tier_id UUID REFERENCES ticket_tiers(id),
  event_id UUID REFERENCES events(id),
  holder_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  qr_code TEXT UNIQUE NOT NULL,   -- cryptographically signed token
  booking_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',   -- active | redeemed | refunded | expired
  purchased_at TIMESTAMP DEFAULT NOW(),
  redeemed_at TIMESTAMP
);
```

### Quests & Gamification
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,                      -- explorer | academic | social | daily | weekly
  xp_reward INTEGER NOT NULL,
  badge_id UUID,
  edurev_linkage BOOLEAN DEFAULT false,
  location_required BOOLEAN DEFAULT false,
  target_location JSONB,          -- {lat, lng, radius_meters}
  completion_criteria JSONB,      -- {"action": "visit", "count": 1}
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE quest_progress (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  quest_id UUID REFERENCES quests(id),
  status TEXT DEFAULT 'in_progress', -- in_progress | completed | expired
  progress_data JSONB,            -- {"visited_zones": ["tech_district"]}
  completed_at TIMESTAMP,
  xp_awarded INTEGER,
  UNIQUE(profile_id, quest_id)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rarity TEXT,                    -- common | rare | epic | legendary
  criteria TEXT
);

CREATE TABLE profile_badges (
  profile_id UUID REFERENCES profiles(id),
  badge_id UUID REFERENCES badges(id),
  awarded_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (profile_id, badge_id)
);
```

---

## Part 5 — AI/ML Implementation Blueprints

### 5.1 SquadUp Matching Algorithm

```typescript
// Compatibility Score Calculation (0-100)
interface MatchScore {
  skillComplement: number;  // 0-40 pts — how well skills complement each other
  goalAlignment: number;    // 0-25 pts — similar competition goals
  availability: number;     // 0-20 pts — overlapping free time
  achievementLevel: number; // 0-10 pts — similar EduRev/XP tier
  socialGraph: number;      // 0-5 pts  — mutual club members (warm intro signal)
}

function calculateMatchScore(userA: Profile, userB: Profile): number {
  // 1. Skill Complement (want different skills, not same)
  const sharedSkills = intersection(userA.skills, userB.skills);
  const uniqueSkillsB = difference(userB.skills, userA.skills);
  const skillScore = (uniqueSkillsB.length / MAX_SKILLS) * 40;

  // 2. Goal Alignment
  const goalScore = userA.currentGoal === userB.currentGoal ? 25 : 12;

  // 3. Availability Overlap
  const availabilityScore = calculateAvailabilityOverlap(userA, userB) * 20;

  // 4. Achievement Level (prevent skill cliff — don't match legend with newbie)
  const levelDiff = Math.abs(userA.level - userB.level);
  const achieveScore = levelDiff <= 2 ? 10 : Math.max(0, 10 - levelDiff * 2);

  // 5. Social Graph Warmth
  const mutualClubs = intersection(userA.clubs, userB.clubs).length;
  const socialScore = Math.min(5, mutualClubs * 2);

  return skillScore + goalScore + availabilityScore + achieveScore + socialScore;
}
```

### 5.2 Lost & Found AI Matching

```typescript
// When a new "Found Item" is posted:
async function matchFoundItem(foundItem: FoundItem) {
  // 1. Extract features from image (if provided)
  const imageEmbedding = foundItem.image 
    ? await getCLIPEmbedding(foundItem.image) 
    : null;
  
  // 2. Extract text features
  const textEmbedding = await getTextEmbedding(
    `${foundItem.category} ${foundItem.description}`
  );
  
  // 3. Find candidate lost items (same category, within 7 days, nearby location)
  const candidates = await db.query(`
    SELECT * FROM lost_items 
    WHERE category = $1 
    AND reported_at > NOW() - INTERVAL '7 days'
    AND ST_DWithin(last_seen_location, $2, 500)  -- within 500m
    AND status = 'open'
  `, [foundItem.category, foundItem.location]);
  
  // 4. Score each candidate
  const scored = await Promise.all(candidates.map(async (lost) => {
    const lostTextEmb = await getTextEmbedding(lost.description);
    const textSim = cosineSimilarity(textEmbedding, lostTextEmb);
    
    let imageSim = 0;
    if (imageEmbedding && lost.image_embedding) {
      imageSim = cosineSimilarity(imageEmbedding, lost.image_embedding);
    }
    
    const finalScore = (textSim * 0.4) + (imageSim * 0.6);
    return { lost, score: finalScore };
  }));
  
  // 5. Notify top matches (score > 0.7 threshold)
  const matches = scored.filter(s => s.score > 0.7).sort((a,b) => b.score - a.score);
  for (const match of matches.slice(0, 3)) {
    await sendNotification(match.lost.reporter_id, {
      title: "Possible match found for your lost item!",
      body: `Someone found a ${foundItem.category} near ${foundItem.location_name}`,
      data: { foundItemId: foundItem.id, matchScore: match.score }
    });
  }
}
```

### 5.3 EduRevolution Auto-Classification

```typescript
// When student describes an achievement in free text:
async function classifyAchievement(description: string): Promise<EduRevCategory> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 500,
    system: `You are an LPU EduRevolution advisor. 
    Classify student achievements into categories:
    - RESEARCH_PAPER (journal, conference, preprint)
    - COMPETITION_WIN (hackathon, sports, cultural contest)
    - CERTIFICATION (NPTEL, AWS, Google, Coursera, etc.)
    - PATENT (filed or published)
    - INTERNSHIP (paid, stipend mentioned)
    - STARTUP (registered company or prototype)
    - MOOC (online course completion)
    
    Also estimate: attendance_relaxation (%), grade_benefit (description)
    Return JSON only.`,
    messages: [{
      role: "user",
      content: `Classify this achievement: "${description}"`
    }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

---

## Part 6 — API Contract (Key Endpoints)

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
POST /api/v1/squad/swipe         → Record swipe action {targetId, action}
GET  /api/v1/squad/matches       → Get all mutual matches
POST /api/v1/squad/team          → Create team from matches
GET  /api/v1/squad/teams         → Get user's teams
POST /api/v1/squad/recruit       → Post recruitment card (clubs)
GET  /api/v1/squad/recruits      → Browse recruitment postings
```

### Events
```
GET  /api/v1/events              → List events (filter: lat/lng/radius, category, date)
POST /api/v1/events              → Create event (club_admin only)
GET  /api/v1/events/:id          → Event detail
POST /api/v1/events/:id/rsvp     → RSVP (free events)
POST /api/v1/events/:id/ticket   → Purchase ticket
GET  /api/v1/events/:id/qr       → Get QR code for ticket
POST /api/v1/events/:id/checkin  → Verify QR (organizer)
GET  /api/v1/events/:id/stats    → Analytics (organizer)
```

### Quests
```
GET  /api/v1/quests              → Active quests for user
POST /api/v1/quests/:id/verify   → Submit location proof for quest completion
GET  /api/v1/quests/leaderboard  → Campus XP leaderboard
GET  /api/v1/profile/badges      → User's earned badges
```

### EduRevolution
```
POST /api/v1/edurev/achievement  → Log new achievement (AI-classifies)
GET  /api/v1/edurev/benefits     → Calculate eligible benefits
POST /api/v1/edurev/submit       → Submit to official portal
GET  /api/v1/edurev/history      → All submissions + status
GET  /api/v1/edurev/admin/queue  → Admin: pending approvals
PATCH /api/v1/edurev/admin/:id   → Admin: approve/reject
```

### Lost & Found
```
POST /api/v1/lostfound/lost      → Report lost item
POST /api/v1/lostfound/found     → Report found item
GET  /api/v1/lostfound/matches   → AI-suggested matches for my lost items
POST /api/v1/lostfound/:id/claim → Claim a found item
```

---

## Part 7 — Hackathon Execution Checklist

### Day 1 — Foundation (Hours 0-8)
- [ ] Set up monorepo with turborepo
- [ ] Initialize React Native Expo app with routing
- [ ] Set up Supabase project + run initial migrations
- [ ] Configure Firebase auth (OTP via LPU email)
- [ ] Set up Mapbox account + ingest LPU campus GeoJSON
- [ ] Build design system: colors, typography, components
- [ ] Build onboarding flow (3 screens)

### Day 1 — Core Screens (Hours 8-16)
- [ ] CampusVerse map screen (basic Mapbox integration)
- [ ] SquadUp swipe deck (gesture handler + card stack)
- [ ] Profile screen with skill tags
- [ ] Event listing screen with map pins
- [ ] Bottom navigation shell

### Day 2 — Polish & AI (Hours 16-28)
- [ ] Fog-of-war overlay on map (Mapbox fill-opacity layer)
- [ ] Event pin animations
- [ ] Swipe card animation physics (spring, rotation, fade)
- [ ] QR ticket generation + camera scanner
- [ ] EduRevolution dashboard screen
- [ ] Quest board screen with XP progress bar
- [ ] Club directory screen

### Demo Prep (Hours 28-36)
- [ ] Seed database with 50 fake profiles, 10 events, 5 clubs
- [ ] Record demo video walkthrough
- [ ] Prepare pitch deck with Problem Validation data
- [ ] Deploy backend to Railway
- [ ] Generate shareable APK

---

## Part 8 — Security & Privacy Rules

### Data Minimization
- Collect only what's needed (no "optional but we want it" fields)
- Location: Only collected during quest verification, never stored persistently
- Student ID photos: Deleted after verification

### Matching Privacy
- A student's swipe history is **never visible** to anyone, including admins
- Rejected profiles don't know they were rejected
- Match is only revealed when **both** parties swipe right

### Content Moderation
- Report button on every post, profile, and chat message
- AI pre-screening for toxic content in public posts (LLM-based moderation)
- Strike system: 3 reports → temporary suspension → admin review

### Data Retention
- Account deactivation: 29-day recovery window (Macbease parity)
- After 29 days: soft delete (data anonymized, not deleted, for abuse prevention)
- Chat messages: User-deletable, auto-expire after 1 year

---

## Part 9 — Definition of Done (Per Feature)

A feature is "Done" when:
1.  Core user flow works end-to-end on both iOS and Android
2.  Error states handled (network error, empty state, loading state)
3.  Accessibility: keyboard navigable, screen reader labeled
4.  Performance: < 200ms response for user actions
5.  Test coverage: ≥ 70% for service-layer logic
6.  Reviewed for data privacy compliance
7.  Offline behavior defined and implemented or explicitly deferred

---

*Document prepared for: Hackathon Submission — Campus Life & Student Experience Track*
*Team: Paladeium | University: Lovely Professional University*

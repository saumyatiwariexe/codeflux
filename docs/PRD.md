#  Product Requirements Document (PRD)
## Paladeium — The LPU Student Life Super-App
**Tagline:** *"Your Campus. Your Quests. Your People."*
**Document Version:** 1.0 | **Date:** September 2026 | **Status:** Hackathon Draft

---

## Executive Summary

**Paladeium** is a mobile-first campus super-app designed exclusively for Lovely Professional University that merges the best elements of:
- **Hinge** → swipe-based skill-matched teammate finding
- **GTA 5 Map** → vectorized LPU campus with fog-of-war exploration
- **Pokémon GO** → location-based quests and real-world rewards
- **LinkedIn** → professional academic profiles and achievement portfolios
- **Unstop** → hackathon & competition discovery and team formation
- **Discord** → club and community spaces with tiered access
- **Google Maps** → indoor navigation for a 600-acre campus

The result is a single app where every friction point of LPU student life is solved gamefully, socially, and intelligently.

---

## 1. Vision & Mission

**Vision:** Make every LPU student feel at home on day one, connected to their tribe, and empowered to achieve more — backed by campus systems that actually work.

**Mission:** Replace the chaos of WhatsApp groups, Instagram stories, physical notice boards, and fragmented portals with a single, delightful app that is the operating system for LPU student life.

---

## 2. Target Users & Personas

### Persona 1 — "The Fresher" (Aanya, 18, B.Tech CSE Year 1)
- **Goal:** Navigate campus, make friends, find clubs, understand EduRevolution
- **Pain:** Lost, overwhelmed, misses events, has no teammates for upcoming hackathons
- **App Use:** Onboarding via campus exploration quests, joins clubs, swipes to find study partners

### Persona 2 — "The Hustler" (Rohan, 20, B.Tech CSE Year 3)
- **Goal:** Find skilled teammates for hackathons, build portfolio, win competitions
- **Pain:** Can't find good ML/frontend developers in time for registrations
- **App Use:** Posts recruitment cards, swipes through skill-matched profiles, applies for events

### Persona 3 — "The Club Lead" (Priya, 21, Final Year, Coding Club Head)
- **Goal:** Recruit the best freshers, manage events, track club analytics
- **Pain:** Recruitment via Instagram DMs is chaotic; no data on event attendance
- **App Use:** Club dashboard, posts recruitment, manages QR check-ins, views analytics

### Persona 4 — "The Achiever" (Arjun, 22, M.Tech, 2 research papers)
- **Goal:** Track and claim EduRevolution benefits efficiently
- **Pain:** Doesn't know what benefits he's eligible for; submission process is confusing
- **App Use:** EduRevolution dashboard, achievement log, automated benefit calculation

### Persona 5 — "The International Student" (Amara, 19, from Nigeria, Pharmacy Year 1)
- **Goal:** Navigate campus, overcome language/cultural barriers, find community
- **Pain:** Everything is unfamiliar; existing apps aren't India-friendly let alone LPU-specific
- **App Use:** Multilingual campus map, international student groups, buddy-matching system

---

## 3. Feature Modules — Deep Specification

---

### MODULE 1:  CampusVerse — The GTA 5 Campus Map

**Overview:** A beautiful, vectorized top-down map of LPU's 600-acre campus that loads with a cinematic GTA 5-style fog-of-war effect. Areas unlock as you physically visit them (GPS verification).

**Core Features:**

#### 1.1 Fog-of-War Exploration
- On first launch, the entire campus is covered in a stylized fog/dark overlay
- As a student physically walks to a location (GPS radius ~50m), the fog lifts in a smooth animation revealing that zone
- Each zone unlock earns **CampusXP** and triggers a "Zone Discovered!" badge
- Fully explored campus = Platinum Explorer badge + EduRevolution-linked quest completion

#### 1.2 Live Event Pins
- Floating animated pins appear on the map for:
  -  Active events (happening right now)
  -  Upcoming events (next 48 hours)
  -  Live sessions (ongoing workshops, guest lectures)
  -  Competitions (registration open)
- Tapping a pin opens an event card with RSVP, map route, and ticket purchase

#### 1.3 Zone Territories
- The campus is divided into named Territories (inspired by Macbease but richer):
  -  Tech District (CSE, ECE blocks)
  -  Creative Quarter (Design, Architecture)
  -  MedZone (Pharmacy, Hospital)
  -  Food Republic (all canteens, Suto Café, Unimall)
  -  Power Zone (Gyms, Sports fields)
  -  Knowledge Core (Central Library, tutorial rooms)
  -  Residential Grid (Hostels)
  -  Green Campus (parks, gardens, open areas)

#### 1.4 Indoor Navigation
- Block-level routing: "Find shortest path from Block B to Block G, Floor 3"
- Room-number search (e.g., "B4-302")
- Accessible route mode (elevator-preferred paths)
- Offline-cached maps (works without internet)

#### 1.5 Real-Time Overlays
- Student density heatmap (shows busy areas to avoid queues)
- Food court wait time estimator
- Available study rooms in the library (green/red indicators)
- Weather overlay (monsoon = indoor route suggestions)

**2D / 3D Switcher:** Button to toggle between top-down 2D and isometric 3D view

---

<!-- Updated by AMD-006 -->
### MODULE 2:  SquadUp — Hinge-Style Teammate Matching

**Overview:** The heart of Paladeium. A vertical-scroll, content-driven team-finding feature that matches students based on skills, interests, availability, and goals. Like Hinge, but for building your hackathon dream team. Instead of swiping superficially, users scroll through rich profiles and "like" specific prompts or portfolio items.

**Core Features:**

#### 2.1 Smart Profile Feed
Each student's profile is rendered as a vertical stack of interactive blocks:
- **Hero Block:** Profile photo, Name, Branch, Year, Hostel/Day Scholar
- **Skill Tags:** Frontend, ML, UI/UX, Backend, Blockchain, Video Editing, Marketing...
- **Current Goal:** "Looking for hackathon team", "Open to projects", "Startup co-founder"
- **Interactive Prompts:** "I geek out on...", "My biggest flex..." (Users can like/comment specifically on these)
- **Achievement Badges:** EduRevolution level, competition wins, club roles
- **Availability:** This weekend / Next month / Always
- **Portfolio highlights:** 3 pinned projects with tech stack

#### 2.2 Interaction Mechanics
-  **Vertical Scroll** → Scroll through the feed of curated profiles
-  **Like a Specific Block** → Tap the heart on a specific prompt, skill, or photo to show interest
-  **Message First** → Attach a note to your like (e.g. replying to their prompt)
-  **Pass** → Tap the 'X' to move to the next profile without interacting

#### 2.3 AI Recommendation Engine
- **Complementary Skill Matching:** If you're a backend dev, prioritize frontend/ML people
- **Competition-Specific Mode:** "I need a team for HackLPU — find me 3 people" → AI curates deck
- **Availability Filtering:** Match only people free the same weekend
- **Department Diversity:** Encourage cross-department teams (CSE + Design + Business)
- **EduRevolution Score Weighting:** Higher achievers surface more (incentivizes participation)

#### 2.4 Team Formation Flow
1. Match → Chat unlocks
2. Chat → "Create Team" button
3. Team page: team name, roles assigned, competition linked
4. Team applies to event directly from the team page
5. Team chat with file sharing (for problem statements, etc.)
6. Post-competition: Team page archived as shared memory

#### 2.5 Recruitment Posts (Club/Event Mode)
- Clubs post recruitment cards visible in the SquadUp deck
- Card shows: Club name, role available (VP Marketing, Graphic Designer), requirements
- Apply with one tap → goes to club's recruitment pipeline
- Club sees applications with skill tags for fast shortlisting

---

### MODULE 3:  QuestZone — Gamified Campus Life

**Overview:** A Pokémon GO-style quest system that makes exploring campus, attending events, joining clubs, and growing academically feel like leveling up in a game.

**Core Features:**

#### 3.1 Quest Types

** Explorer Quests** (Campus Discovery)
- "Visit the Central Library for the first time" → +50 XP
- "Eat at 5 different food courts" → +100 XP + Food Explorer badge
- "Find the secret garden behind Block 32" → +200 XP + Rare badge
- "Visit all 8 campus territories in one week" → Platinum Explorer achievement

** Academic Quests** (EduRevolution-linked)
- "Submit your first EduRevolution achievement" → +300 XP
- "Attend 3 workshops this month" → +150 XP
- "Get a certification on NPTEL/SWAYAM" → +500 XP + EduRev point boost
- "Win a competition" → +1000 XP + Gold badge

** Social Quests** (Community Building)
- "Join your first club" → +100 XP
- "Make 5 SquadUp matches" → +200 XP
- "Post in community feed for the first time" → +50 XP
- "Attend an event with your SquadUp team" → +300 XP

** Daily/Weekly Quests** (Retention)
- "Check in to campus today" → +10 XP
- "Explore a new Territory this week" → +75 XP
- "Complete your profile" → +200 XP

#### 3.2 XP & Leveling System
| Level | Title | XP Required |
|---|---|---|
| 1 | Campus Newbie | 0 |
| 2 | Zone Explorer | 500 |
| 3 | Club Member | 1,500 |
| 4 | Campus Regular | 3,500 |
| 5 | SquadLeader | 7,000 |
| 6 | Campus Legend | 15,000 |
| 7 | LPU Icon | 30,000 |

#### 3.3 Rewards & Redemption
- **Campus Rewards:** Free canteen item, priority library seat booking, merchandise
- **EduRevolution Sync:** Quest XP contributes to EduRevolution benefit eligibility
- **Partner Rewards:** Discounts at Suto Café, Unimall shops, campus print shops
- **NFT-style Digital Badges:** Unique, non-transferable achievement badges displayed on profile

#### 3.4 Leaderboards
- **All-Campus Leaderboard** (weekly, monthly, all-time)
- **Department Leaderboard** (CSE vs ECE vs Design...)
- **Batch Leaderboard** (Year 1 vs Year 2...)
- **Club Leaderboard** (which club has the most active members)

---

### MODULE 4:  ClubVerse — Club & Community Ecosystem

**Overview:** A Discord-meets-LinkedIn layer for every LPU club and academic community.

**Core Features:**

#### 4.1 Club Directory
- Searchable directory of all 200+ LPU clubs
- Filter by: Category (Tech, Cultural, Sports, Social), Department, Rating, Size
- Each club card shows: Logo, name, description, member count, recruitment status, rating
- "Open for Recruitment" badge when accepting applications

#### 4.2 Club Home Page
- **About:** Mission, founding year, current leadership
- **Feed:** Posts, announcements, event highlights
- **Members:** Visual grid of all members with roles
- **Events:** Upcoming and past events by this club
- **Achievements:** Trophies, competition wins, EduRevolution points
- **Gallery:** Photos/videos from events
- **Join / Apply button**

#### 4.3 Club Dashboard (Admin View)
- **Recruitment Pipeline:** Kanban board (Applied → Reviewed → Interviewed → Accepted)
- **Event Management:** Create event, set tickets, manage RSVP
- **Analytics Dashboard:**
  - Member growth over time
  - Event attendance rates
  - Post engagement metrics
  - EduRevolution contribution tracker
- **Automated Emails:** RSVP confirmation, reminder, rejection with feedback
- **QR Check-in:** Generate QR codes for events, scan to verify attendance

#### 4.4 Academic Communities
- Course-specific study rooms (e.g., "CSE 316 — OS Study Group")
- Resource sharing: Notes, previous year papers, assignments
- Doubt posting with peer Q&A
- Faculty can participate (optional, admin-verified)
- Private/Public toggle for communities

#### 4.5 Discord-Style Channels
Within each club/community:
- `#announcements` (admin only)
- `#general` (open chat)
- `#resources` (file sharing)
- `#recruitment` (application discussion)
- Voice/video rooms for meetings (WebRTC)

---

### MODULE 5:  EventHub — Events, Ticketing & RSVP

**Overview:** One-stop shop for discovering, registering for, and attending every campus event.

**Core Features:**

#### 5.1 Event Discovery
- **On Map:** Floating pins on CampusVerse for active/upcoming events
- **On Feed:** Event cards in home feed (algorithmically ranked by interest)
- **Explore Tab:** Category browser (Hackathons, Cultural, Sports, Workshops, Fests)
- **Calendar View:** Month/week calendar of all events you've RSVPed or might like

#### 5.2 Event Creation (For Clubs/Organizers)
- Step-by-step wizard: Name → Description → Location (map pin) → Date/Time → Ticket Tiers → Problem Statement (for hackathons) → Team Requirements
- Upload: Poster, sponsorship details, schedule
- **Conflict Detection:** System warns if event overlaps with another major event
- **Automated RSVP emails:** Confirmation, day-before reminder, post-event review request

#### 5.3 Ticket System
- **Free RSVP** or **Paid Tickets** (UPI/Card integration)
- **Tier Support:** General / Silver / Gold / VIP with different perks
- **Group Ticket:** Team buys tickets together (linked to SquadUp team)
- **Digital Pass Wallet:** "My Tickets" screen with QR codes, booking IDs
- **QR Verification:** Organizer scans → instant attendance confirmation
- **Offline QR:** Works without internet (time-locked)

#### 5.4 Post-Event
- Review & rating system for events
- Automatic memory added to Memory Lane
- Photo gallery unlocks for attendees
- Post-event analytics sent to organizer dashboard
- Certificate generation (PDF with QR-verified authenticity)

---

### MODULE 6:  EduRev Connect — EduRevolution Integration

**Overview:** The only app with official EduRevolution integration — turning LPU's transformative academic initiative into a tangible, trackable, rewarding experience.

**Core Features:**

#### 6.1 Achievement Tracker
- Students log achievements in structured categories:
  -  Research Papers (journal, conference)
  -  Competition Wins (hackathon, sports, cultural)
  -  Certifications (NPTEL, AWS, Google, Coursera)
  -  Patents (filed, published)
  -  Internships (duration, company, stipend)
  -  Startups (registered, revenue, team size)
  -  MOOCs & Self-Learning

#### 6.2 Benefit Calculator
- Real-time display: "Based on your achievements, you qualify for:"
  -  Grade Exemption in [Subject]
  -  Attendance Relaxation (X%)
  -  Scholarship Eligibility
- One-tap submission to EduRevolution portal (pre-fills form data)

#### 6.3 EduRev Dashboard (Admin/DSW View)
- Student achievement submissions with status (Pending / Approved / Rejected)
- Filter by department, year, achievement type
- Bulk approval tools
- Analytics: Participation rates by department, trending achievement types
- Export reports (CSV/PDF) for university records

#### 6.4 Quest Integration
- Quest completions that qualify for EduRevolution auto-submit evidence
- E.g., "Attended 5 workshops" → attendances logged via QR check-in → auto-generates EduRev proof
- Removes the manual submission burden entirely

---

### MODULE 7:  LostPulse — Smart Lost & Found

**Overview:** AI-powered lost item recovery system. Post what you lost, AI matches it with found items.

**Core Features:**

#### 7.1 Post Lost Item
- Photo upload (optional) → AI extracts description tags automatically
- Category: Electronics, ID Card, Clothing, Keys, Books, Other
- Last seen location: Pick on CampusVerse map
- Contact preference: Anonymous (admin mediates) or direct
- Auto-expire: Post auto-closes after 30 days

#### 7.2 Post Found Item
- Similar form with location where found
- Hand-off options: Left at [location], Hold until claimed

#### 7.3 AI Matching Engine
- Image similarity matching (computer vision)
- Text description NLP matching
- Location proximity weighting (items found near last-seen location ranked higher)
- Auto-notification: "We found a possible match for your lost [wallet]"

#### 7.4 Claim Verification
- Claimant answers "proof of ownership" questions generated from the found item description
- Video call verification option
- Security escort to handoff location

---

### MODULE 8:  Social Layer — Feed, Stories & Memories

**Overview:** Campus-specific social feed that captures the vibrancy of LPU life.

**Core Features:**

#### 8.1 Home Feed
- Stories (24hr expiring, campus-only)
- Campus posts (text, photo, video)
- Event announcements
- Club updates
- Short vertical video reels ("Glimpses") — campus talent, highlights, event recaps

#### 8.2 Speed-Dial FAB
Floating action button that expands to:
-  Capture a Moment
-  Post an Update
-  Post a Recruitment
-  Create an Event
-  Report Lost Item

#### 8.3 Memory Lane
- Calendar-indexed personal archive of campus memories
- Auto-populated from: Events attended, quests completed, clubs joined, team formations
- Memory sharing: Create a "Campus Story" visual recap
- Memory Bin with 30-day recovery

---

### MODULE 9:  PulseChat — Messaging & Community Rooms

**Overview:** End-to-end encrypted messaging with club rooms, team chats, and tier-gated event rooms.

**Core Features:**

- **1:1 DMs:** Only between matched SquadUp connections or mutual club members
- **Team Chats:** Auto-created when a SquadUp team forms
- **Club Rooms:** Community channels within clubs (Discord-style)
- **Event Rooms:** Auto-created for event attendees; tier-gated (General vs VIP)
- **Academic Study Rooms:** Course-specific doubt-solving channels
- **Message Features:** File sharing (PDF, images), voice notes, reactions, pinned messages, GIFs

---

### MODULE 10:  Profile & Identity

**Overview:** A rich student identity layer that goes beyond Macbease.

**Core Features:**

#### 10.1 Profile Sections
- **Hero:** Photo, name, @handle, dept/year, pronouns
- **Bio:** Short intro
- **Skills Wall:** Visual tag cloud with proficiency levels
- **Achievement Wall:** EduRevolution badges, competition wins, certifications
- **Portfolio:** 3 pinned projects (GitHub link, description, tech stack)
- **Clubs & Communities:** Roles across all clubs
- **Memory Lane Preview:** Last 3 campus memories
- **SquadUp Stats:** Teams formed, competitions entered, wins
- **Settings:** App preferences including a **Light / Dark Theme Toggle**

#### 10.2 Verification Tiers
-  Email Verified (LPU email)
-  Student ID Verified (photo upload → admin verified)
-  Phone Verified
-  EduRevolution Verified (linked to UMS)

#### 10.3 Profile Sharing
- QR Code (scannable at offline events)
- Deep link URL (share on WhatsApp, LinkedIn)
- Digital Business Card (NFC-tap on Android)

---

## 4. Navigation Architecture

```
 Paladeium

┌─ Bottom Navigation ─────────────────────────────┐
│                                                  │
│   HOME      MAP       SQUAD     CLUBS    ME │
│                                                  │
└──────────────────────────────────────────────────┘

 HOME TAB
├── Stories Row
├── Activity Feed (posts, events, club updates)
├── Live Event Banner (if something is happening now)
├── Quests Carousel (daily/weekly)
└── Speed-Dial FAB (+)

 MAP TAB (CampusVerse)
├── Vectorized LPU Map (fog-of-war)
├── Floating Event Pins
├── Zone Territory Labels
├── 2D/3D Toggle
├── Search Bar (room/block/facility)
├── My Location
├── Navigation Mode (turn-by-turn)
└── Layers: Events | Density | Food | Study Rooms

 SQUAD TAB (SquadUp)
├── Swipe Deck (skill-matched profiles)
├── My Matches
├── Active Teams
├── Recruitment Feed (club postings)
└── Competition Browser

 CLUBS TAB (ClubVerse)
├── My Clubs
├── Browse All Clubs
├── Academic Communities
├── Event Hub
├── Lost & Found
└── EduRev Connect

 ME TAB (Profile)
├── My Profile
├── My Tickets
├── Achievement Wall
├── Memory Lane
├── My Quests & XP
└── Settings

☰ SIDE DRAWER
├── My Tickets
├── My Spaces
├── Offers & Quests
├── EduRev Dashboard
├── Lost & Found
├── Create Space
├── Settings & Privacy
└── Day / Night Mode
```

---

## 5. Success Metrics (KPIs)

| Metric | Hackathon Target | 3-Month Target | 1-Year Target |
|---|---|---|---|
| Downloads | Demo | 5,000 | 25,000+ |
| DAU/MAU Ratio | — | 40%+ | 60%+ |
| SquadUp Matches/day | Demo | 200+ | 2,000+ |
| Events Listed | Demo | 100+ | 500+ |
| QR Check-ins | Demo | 1,000+ | 10,000+ |
| EduRev Submissions | Demo | 500+ | 5,000+ |
| Club Registrations | Demo | 50+ clubs | 200+ clubs |
| Quest Completions/day | Demo | 1,000+ | 10,000+ |

---

## 6. Monetization Strategy

| Revenue Stream | Description | Timeline |
|---|---|---|
| **Freemium SquadUp** | Free: 10 swipes/day. Premium: Unlimited + Super Connects | Phase 2 |
| **Club Pro Dashboard** | Analytics, custom branding, priority listing for clubs | Phase 2 |
| **Event Commission** | 3-5% on paid ticket sales | Phase 1 |
| **Sponsored Quests** | Brands sponsor quests (e.g., "Visit TCS placement drive → earn 500 XP") | Phase 3 |
| **Campus Ads** | Hyper-local ads for canteens, print shops, hostels in feed | Phase 3 |
| **EduRev Premium** | Automated benefit tracking, one-click submission | Phase 2 |

---

## 7. Technical Architecture (High Level)

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (Mobile)                  │
│         React Native / Flutter + Expo               │
│    Maps: Mapbox GL JS (custom LPU vector tiles)     │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│                   API GATEWAY                       │
│            Node.js / Express + GraphQL              │
└──────┬──────────┬──────────┬────────────────────────┘
       │          │          │
┌──────▼──┐  ┌───▼───┐  ┌───▼──────────────────────┐
│ Auth    │  │ Maps  │  │   Microservices           │
│ Firebase│  │ API   │  │  - SquadUp Engine         │
│ + OTP   │  │ Mapbox│  │  - Quest Engine           │
└─────────┘  └───────┘  │  - EduRev Connector       │
                         │  - Event/Ticket Service   │
                         │  - Lost & Found AI        │
                         │  - Push Notifications     │
                         └──────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────▼──┐    ┌──────▼─┐     ┌──────▼─┐
              │Postgres│    │MongoDB │     │Redis   │
              │(Core   │    │(Social │     │(Cache, │
              │ Data)  │    │ Data)  │     │ Queues)│
              └────────┘    └────────┘     └────────┘
```

**AI/ML Stack:**
- **Matching Engine:** Collaborative filtering + skill graph embeddings
- **Lost & Found:** OpenCV + CLIP image similarity
- **Quest Personalization:** Bandit algorithm for quest recommendation
- **Feed Ranking:** Weighted engagement scoring

---

## 8. Design System

**Adopted Design System:** Stitch Minimalist Social Discovery Platform UI

**Color Palette (Stitch UI Based):**
- Primary: `#6C63FF` (Electric Violet — energy, campus vibrancy)
- Secondary: `#FF6584` (Coral — warmth, connection)
- Accent: `#43E97B` (Neon Emerald — XP, progress, quests)
- Background (Dark): Deep Space Canvas (`#0B0C14` / `#121324`)
- Theme Toggle: Support for both Light and Dark modes accessible from Settings.
- Gold: `#F59E0B` (Achievements, badges)

**Typography:**
- Headings & Displays: `Outfit` (bold, geometric)
- Body & Controls: `Inter` (clean, high x-height)

**Design Language (Apple-Minimalist Glassmorphism):**
- Frosted glass containers with ultra-fine borders (`backdrop-blur-2xl`)
- Gradient accents and chromatic back-glows
- Pill geometry and continuous Apple squircle curves (`rounded-2xl`, `rounded-3xl`)
- Smooth spring physics animations and micro-interactions

---

## 9. Phased Rollout

### Phase 0 — Hackathon (This Weekend)
-  High-fidelity UI prototype (all key screens)
-  CampusVerse map mockup with event pins
-  SquadUp swipe deck demo
-  EduRev dashboard wireframe
-  This PRD + Problem Validation document

### Phase 1 — MVP (Month 1-2)
- User auth (LPU email)
- Basic campus map (static zones, event pins)
- SquadUp swipe deck (first 100 users seeded)
- Event creation + QR check-in
- Basic club directory

### Phase 2 — Growth (Month 3-6)
- Fog-of-war map goes live
- Quest system
- EduRevolution integration
- Full club dashboards
- Lost & Found

### Phase 3 — Scale (Month 6-12)
- AI matching upgrade
- Monetization launch
- Multi-campus expansion (other Indian universities)
- AR features (Phase 4 potential)

---

*Document prepared for: Hackathon Submission — Campus Life & Student Experience Track*
*Team: Paladeium | University: Lovely Professional University*

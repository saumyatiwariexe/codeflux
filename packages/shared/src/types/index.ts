// ============================================================
// Paladeium — Shared TypeScript Types
// Used by both the Fastify API and the React Native mobile app
// ============================================================

// ---- API Response Wrapper ----

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// ---- Auth ----

export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

// ---- User & Profile ----

export interface User {
  id: string;
  lpuEmail: string;
  phone?: string;
  firebaseUid?: string;
  isIdVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  department: string;
  year: number;
  degreeLevel: 'UG' | 'PG' | 'PhD';
  stream?: string;
  pronouns?: string;
  hostelBlock?: string;
  isDayScholar: boolean;
  campusXp: number;
  level: number;
  squadVisibility: 'all' | 'dept' | 'off';
  onboardingComplete: boolean;
  skills?: ProfileSkill[];
  badges?: ProfileBadge[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'Tech' | 'Design' | 'Business' | 'Research' | 'Sports' | 'Arts';
  icon?: string;
}

export interface ProfileSkill {
  skillId: string;
  skill: Skill;
  proficiency: 'beginner' | 'intermediate' | 'expert';
}

export interface ProfileBadge {
  badgeId: string;
  badge: Badge;
  awardedAt: string;
}

// ---- SquadUp ----

export type SwipeAction = 'like' | 'pass' | 'super';
export type SwipeContext = 'hackathon' | 'project' | 'general' | 'internship';

export interface SquadSwipe {
  id: string;
  swiperId: string;
  swipedId: string;
  action: SwipeAction;
  context: SwipeContext;
  createdAt: string;
}

export interface SquadMatch {
  id: string;
  userA: string;
  userB: string;
  matchedAt: string;
  teamId?: string;
  status: 'matched' | 'teamed' | 'archived';
  otherProfile?: Profile;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  goal?: string;
  competitionId?: string;
  creatorId: string;
  maxMembers: number;
  status: 'forming' | 'complete' | 'competing' | 'archived';
  createdAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  teamId: string;
  profileId: string;
  role?: string;
  joinedAt: string;
  profile?: Profile;
}

export interface SwipeDeckCard extends Profile {
  matchScore: number;
  skillComplementScore: number;
  mutualClubs: string[];
  matchReason?: string;
}

// ---- Events ----

export type EventCategory = 'hackathon' | 'workshop' | 'cultural' | 'sports' | 'academic';
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string;
  organizerId: string;
  organizerType: 'club' | 'user' | 'admin';
  locationName?: string;
  locationCoords?: { lat: number; lng: number };
  blockReference?: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  maxAttendees?: number;
  registrationDeadline?: string;
  posterUrl?: string;
  status: EventStatus;
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  createdAt: string;
  tiers?: TicketTier[];
  attendeeCount?: number;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity?: number;
  perks?: string[];
  soldCount: number;
}

export interface Ticket {
  id: string;
  tierId: string;
  eventId: string;
  holderId: string;
  teamId?: string;
  qrCode: string;
  bookingId: string;
  status: 'active' | 'redeemed' | 'refunded' | 'expired';
  purchasedAt: string;
  redeemedAt?: string;
  event?: Event;
  tier?: TicketTier;
}

// ---- Clubs ----

export interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: 'tech' | 'cultural' | 'sports' | 'academic' | 'social';
  logoUrl?: string;
  bannerUrl?: string;
  memberCount: number;
  isRecruiting: boolean;
  applicationDeadline?: string;
  socialLinks?: Record<string, string>;
  createdAt: string;
}

export interface ClubMembership {
  clubId: string;
  profileId: string;
  role: 'member' | 'coordinator' | 'president' | 'faculty_advisor';
  joinedAt: string;
}

// ---- Quests ----

export type QuestType = 'explorer' | 'academic' | 'social' | 'daily' | 'weekly';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  type: QuestType;
  xpReward: number;
  badgeId?: string;
  edurevLinkage: boolean;
  locationRequired: boolean;
  targetLocation?: { lat: number; lng: number; radiusMeters: number };
  completionCriteria?: Record<string, unknown>;
  expiresAt?: string;
  isActive: boolean;
  badge?: Badge;
}

export interface QuestProgress {
  id: string;
  profileId: string;
  questId: string;
  status: 'in_progress' | 'completed' | 'expired';
  progressData?: Record<string, unknown>;
  completedAt?: string;
  xpAwarded?: number;
  quest?: Quest;
}

// ---- Badges ----

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  rarity: BadgeRarity;
  criteria?: string;
}

// ---- EduRevolution ----

export type EduRevCategory =
  | 'RESEARCH_PAPER'
  | 'COMPETITION_WIN'
  | 'CERTIFICATION'
  | 'PATENT'
  | 'INTERNSHIP'
  | 'STARTUP'
  | 'MOOC';

export type EduRevStatus = 'pending' | 'approved' | 'rejected' | 'submitted';

export interface EduRevAchievement {
  id: string;
  profileId: string;
  title: string;
  description: string;
  category: EduRevCategory;
  proofUrl?: string;
  status: EduRevStatus;
  attendanceRelaxation?: number;
  gradeBenefit?: string;
  xpAwarded?: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// ---- Lost & Found ----

export type LostFoundCategory =
  | 'electronics'
  | 'bag'
  | 'wallet'
  | 'id_card'
  | 'keys'
  | 'clothing'
  | 'books'
  | 'other';

export interface LostItem {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  category: LostFoundCategory;
  lastSeenLocation?: string;
  lastSeenAt?: string;
  imageUrl?: string;
  status: 'open' | 'matched' | 'resolved';
  reportedAt: string;
}

export interface FoundItem {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  category: LostFoundCategory;
  foundLocation?: string;
  foundAt?: string;
  imageUrl?: string;
  status: 'unclaimed' | 'matched' | 'returned';
  reportedAt: string;
}

// ---- Campus Map ----

export interface MapZone {
  id: string;
  name: string;
  type: 'academic' | 'hostel' | 'sports' | 'admin' | 'food';
  coordinates: [number, number][];
  color: string;
  isRevealed: boolean;
  buildingCount?: number;
}

export interface MapPOI {
  id: string;
  name: string;
  type: 'building' | 'event' | 'quest' | 'food' | 'lab';
  lat: number;
  lng: number;
  description?: string;
  blockCode?: string;
  eventId?: string;
  questId?: string;
}

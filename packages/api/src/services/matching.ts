import { Profile } from '../../../shared/src/types';

/**
 * Calculates a compatibility score between two profiles for SquadUp matching.
 * Returns a number from 0–100 representing how well the users complement each other.
 *
 * Scoring breakdown:
 * - 0–40 pts: Skill complement (want DIFFERENT skills, not same ones)
 * - 0–25 pts: Goal alignment (same hackathon context)
 * - 0–20 pts: Level proximity (avoid legend–newbie cliff)
 * - 0–10 pts: Availability overlap
 * - 0–5 pts: Social warmth (mutual clubs signal)
 */
export function calculateMatchScore(userA: Profile, userB: Profile): number {
  const skillsA = (userA.skills ?? []).map((s) => s.skill.name);
  const skillsB = (userB.skills ?? []).map((s) => s.skill.name);

  // 1. Skill Complement — reward unique skills B brings that A doesn't have
  const uniqueToB = skillsB.filter((s) => !skillsA.includes(s));
  const skillScore = Math.min(40, (uniqueToB.length / Math.max(skillsB.length, 1)) * 40);

  // 2. Level Proximity — penalize large level gaps
  const levelDiff = Math.abs((userA.level ?? 1) - (userB.level ?? 1));
  const levelScore = Math.max(0, 25 - levelDiff * 5);

  // 3. Department diversity bonus — different departments = more complementary
  const deptBonus = userA.department !== userB.department ? 20 : 10;

  // 4. XP Tier similarity
  const xpDiff = Math.abs((userA.campusXp ?? 0) - (userB.campusXp ?? 0));
  const xpScore = Math.max(0, 10 - Math.floor(xpDiff / 1000));

  // 5. Social warmth (placeholder — in prod: check shared club memberships)
  const socialScore = 5;

  const total = skillScore + levelScore + deptBonus + xpScore + socialScore;
  return Math.min(100, Math.round(total));
}

/**
 * Calculates a percentile match label for display in the UI.
 */
export function getMatchLabel(score: number): string {
  if (score >= 90) return 'Perfect Match';
  if (score >= 75) return 'High Synergy';
  if (score >= 60) return 'Good Fit';
  if (score >= 45) return 'Potential';
  return 'Low Match';
}

/**
 * Calculates the skill complement percentage — shown on SwipeCard.
 */
export function getSkillComplementPercent(userA: Profile, userB: Profile): number {
  const skillsA = (userA.skills ?? []).map((s) => s.skill.name);
  const skillsB = (userB.skills ?? []).map((s) => s.skill.name);
  const uniqueToB = skillsB.filter((s) => !skillsA.includes(s));
  if (skillsB.length === 0) return 0;
  return Math.round((uniqueToB.length / skillsB.length) * 100);
}

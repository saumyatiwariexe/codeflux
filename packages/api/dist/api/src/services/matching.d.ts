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
export declare function calculateMatchScore(userA: Profile, userB: Profile): number;
/**
 * Calculates a percentile match label for display in the UI.
 */
export declare function getMatchLabel(score: number): string;
/**
 * Calculates the skill complement percentage — shown on SwipeCard.
 */
export declare function getSkillComplementPercent(userA: Profile, userB: Profile): number;
//# sourceMappingURL=matching.d.ts.map
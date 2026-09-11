import { Profile } from '../../../shared/src/types';
/**
 * Maps a `profiles` row — optionally with joined `profile_skills(skill:skills(*))`
 * and `profile_badges(badge:badges(*))` — to the API's camelCase Profile shape.
 */
export declare function mapProfileRow(row: any): Profile;
export declare const PROFILE_SELECT_WITH_JOINS = "*, profile_skills(skill_id, proficiency, skill:skills(*)), profile_badges(badge_id, awarded_at, badge:badges(*))";
//# sourceMappingURL=mappers.d.ts.map
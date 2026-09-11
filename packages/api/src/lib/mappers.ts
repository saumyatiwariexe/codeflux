import { Badge, Profile, ProfileBadge, ProfileSkill, Skill } from '../../../shared/src/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapSkill(row: any): Skill {
  return { id: row.id, name: row.name, category: row.category, icon: row.icon ?? undefined };
}

function mapBadge(row: any): Badge {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    rarity: row.rarity,
    criteria: row.criteria ?? undefined,
  };
}

/**
 * Maps a `profiles` row — optionally with joined `profile_skills(skill:skills(*))`
 * and `profile_badges(badge:badges(*))` — to the API's camelCase Profile shape.
 */
export function mapProfileRow(row: any): Profile {
  const skills: ProfileSkill[] | undefined = row.profile_skills?.map((ps: any) => ({
    skillId: ps.skill_id,
    proficiency: ps.proficiency,
    skill: mapSkill(ps.skill),
  }));

  const badges: ProfileBadge[] | undefined = row.profile_badges?.map((pb: any) => ({
    badgeId: pb.badge_id,
    awardedAt: pb.awarded_at,
    badge: mapBadge(pb.badge),
  }));

  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    department: row.department,
    year: row.year,
    degreeLevel: row.degree_level,
    stream: row.stream ?? undefined,
    pronouns: row.pronouns ?? undefined,
    hostelBlock: row.hostel_block ?? undefined,
    isDayScholar: row.is_day_scholar,
    campusXp: row.campus_xp,
    level: row.level,
    squadVisibility: row.squad_visibility,
    onboardingComplete: row.onboarding_complete,
    photos: row.photos ?? [],
    prompts: row.prompts ?? [],
    skills,
    badges,
  };
}

export const PROFILE_SELECT_WITH_JOINS =
  '*, profile_skills(skill_id, proficiency, skill:skills(*)), profile_badges(badge_id, awarded_at, badge:badges(*))';

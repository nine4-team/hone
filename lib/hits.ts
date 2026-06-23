import type { Belt, Hit, Partner, Skill } from './types';
import type { HitSummaryRow } from '../components/HitSummaryList';

export const XP_PER_LEVEL = 10;
export const LEVEL_RING_REFERENCE_LEVEL = 100;

const DEFAULT_BELT: Belt = 'white';

// XP each hit is worth, by the belt of the partner hit on. Stored in fifths of
// a point: every belt value is a multiple of 0.2, so working in integers keeps
// the level math exact and free of floating-point drift (e.g. 3 grey-belt hits
// = 18 fifths = 3.6 XP, never 3.5999999999999996). Adult white..black are 1..5;
// kids ranks (no stripe variants) sit between adult white and blue.
const BELT_POINTS_FIFTHS: Record<Belt, number> = {
  white: 5,
  blue: 10,
  purple: 15,
  brown: 20,
  black: 25,
  kids_white: 5,
  kids_grey: 6,
  kids_yellow: 7,
  kids_orange: 8,
  kids_green: 9,
};

const FIFTHS_PER_POINT = 5;
const FIFTHS_PER_LEVEL = XP_PER_LEVEL * FIFTHS_PER_POINT;

// Belt point value as a real number, for display (white = 1, grey = 1.2, ...).
export const BELT_POINTS: Record<Belt, number> = Object.fromEntries(
  (Object.keys(BELT_POINTS_FIFTHS) as Belt[]).map((belt) => [
    belt,
    BELT_POINTS_FIFTHS[belt] / FIFTHS_PER_POINT,
  ]),
) as Record<Belt, number>;

export function beltPointsFifths(belt?: Belt | null): number {
  return BELT_POINTS_FIFTHS[belt ?? DEFAULT_BELT] ?? BELT_POINTS_FIFTHS[DEFAULT_BELT];
}

export function beltPoints(belt?: Belt | null): number {
  return beltPointsFifths(belt) / FIFTHS_PER_POINT;
}

// Total XP a skill has earned, in fifths of a point. Each hit is worth
// hit.count × the belt points of the partner it was landed on. Hits with no
// partner — or a partner with no belt set — count as white. Belt is read live
// from the current partner record, so changing a partner's belt re-derives
// every past hit's XP.
export function skillXpFifths(hits: Hit[], partners: Partner[]): number {
  const beltByPartnerId = new Map(partners.map((partner) => [partner.id, partner.belt]));

  return hits.reduce((sum, hit) => {
    const belt = hit.partnerId ? beltByPartnerId.get(hit.partnerId) : undefined;
    return sum + hit.count * beltPointsFifths(belt);
  }, 0);
}

// XP as a real number, for display. Pass the fifths total from skillXpFifths.
export function xpFromFifths(totalXpFifths: number): number {
  return Math.max(0, totalXpFifths) / FIFTHS_PER_POINT;
}

// Render an XP value: whole numbers stay whole, fractions show one decimal.
export function formatXp(xp: number): string {
  return Number.isInteger(xp) ? String(xp) : xp.toFixed(1);
}

export type SkillLevelProgress = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  nextLevel: number | null;
  progressToNextLevel: number;
};

// Level progress from a skill's XP total in fifths (from skillXpFifths). Kept in
// integer fifths so the level boundary and "XP into level" are exact; only the
// returned display fields are divided back into real points.
export function getSkillLevelProgress(totalXpFifths: number): SkillLevelProgress {
  const fifths = Math.max(0, Math.round(totalXpFifths));
  const level = Math.floor(fifths / FIFTHS_PER_LEVEL);
  const fifthsIntoLevel = fifths % FIFTHS_PER_LEVEL;
  const fifthsToNextLevel = FIFTHS_PER_LEVEL - fifthsIntoLevel;

  return {
    level,
    totalXp: fifths / FIFTHS_PER_POINT,
    xpIntoLevel: fifthsIntoLevel / FIFTHS_PER_POINT,
    xpToNextLevel: fifthsToNextLevel / FIFTHS_PER_POINT,
    nextLevel: level + 1,
    progressToNextLevel: fifthsIntoLevel / FIFTHS_PER_LEVEL,
  };
}

export function hitRowsByPartner(hits: Hit[], partners: Partner[]): HitSummaryRow[] {
  const rows = new Map<string, HitSummaryRow>();

  hits.forEach((hit) => {
    const partner = partners.find((item) => item.id === hit.partnerId);
    const id = partner?.id ?? 'unattributed';
    const label = partner?.name ?? 'Unattributed';
    const current = rows.get(id);

    rows.set(id, {
      id,
      label,
      count: (current?.count ?? 0) + hit.count,
      href: partner ? `/partners/${partner.id}` : undefined,
    });
  });

  return sortHitRows(Array.from(rows.values()));
}

export function hitRowsBySkill(hits: Hit[], skills: Skill[]): HitSummaryRow[] {
  const rows = new Map<string, HitSummaryRow>();

  hits.forEach((hit) => {
    const skill = skills.find((item) => item.id === hit.skillId);
    const id = skill?.id ?? 'unknown';
    const label = skill?.name ?? 'Unknown skill';
    const current = rows.get(id);

    rows.set(id, {
      id,
      label,
      count: (current?.count ?? 0) + hit.count,
      href: skill ? `/skills/${skill.id}` : undefined,
    });
  });

  return sortHitRows(Array.from(rows.values()));
}

function sortHitRows(rows: HitSummaryRow[]) {
  return rows.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

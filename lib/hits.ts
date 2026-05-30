import type { Hit, Partner, Skill } from './types';
import type { HitSummaryRow } from '../components/HitSummaryList';

export const HITS_PER_LEVEL = 10;
export const MAX_VISIBLE_LEVEL = 10;

export type SkillLevelProgress = {
  level: number;
  totalHits: number;
  hitsIntoLevel: number;
  hitsToNextLevel: number;
  nextLevel: number | null;
  progressToNextLevel: number;
};

export function getSkillLevelProgress(totalHits: number): SkillLevelProgress {
  const normalizedHits = Math.max(0, totalHits);
  const level = Math.min(MAX_VISIBLE_LEVEL, Math.floor(normalizedHits / HITS_PER_LEVEL));
  const isMaxLevel = level >= MAX_VISIBLE_LEVEL;
  const hitsIntoLevel = isMaxLevel ? HITS_PER_LEVEL : normalizedHits % HITS_PER_LEVEL;

  return {
    level,
    totalHits: normalizedHits,
    hitsIntoLevel,
    hitsToNextLevel: isMaxLevel ? 0 : HITS_PER_LEVEL - hitsIntoLevel,
    nextLevel: isMaxLevel ? null : level + 1,
    progressToNextLevel: isMaxLevel ? 1 : hitsIntoLevel / HITS_PER_LEVEL,
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
      href: partner ? `/hit-list/${partner.id}` : undefined,
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

import type { Hit, Partner, Skill } from './types';
import type { HitSummaryRow } from '../components/HitSummaryList';

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

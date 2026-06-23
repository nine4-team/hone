import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActiveSkillTile } from '../../components/ActiveSkillTile';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { QuickAddEntrySheet } from '../../components/EntrySheets';
import { Screen } from '../../components/Screen';
import { SkillPackPicker } from '../../components/SkillPackPicker';
import { BELT_POINTS, XP_PER_LEVEL, skillXpFifths } from '../../lib/hits';
import { skillPacks, type SkillPackSkill } from '../../lib/starterSkills';
import { useHitList } from '../../lib/store';
import type { Hit } from '../../lib/types';
import { spacing } from '../../lib/theme';
import type { Skill } from '../../lib/types';
import { useToast } from '../../lib/useToast';

const activeSkillsHelp = [
  "Your Hit List is the set of skills you're focused on right now.",
  '',
  'Inner ring: level progress.',
  'Outer ring: XP progress toward next level.',
  '',
  `Every ${XP_PER_LEVEL} XP = 1 level.`,
  '',
  'XP per hit by partner belt:',
  '',
  'Adults:',
  `White: ${BELT_POINTS.white} XP`,
  `Blue: ${BELT_POINTS.blue} XP`,
  `Purple: ${BELT_POINTS.purple} XP`,
  `Brown: ${BELT_POINTS.brown} XP`,
  `Black: ${BELT_POINTS.black} XP`,
  '',
  'Kids:',
  `Grey: ${BELT_POINTS.kids_grey} XP`,
  `Yellow: ${BELT_POINTS.kids_yellow} XP`,
  `Orange: ${BELT_POINTS.kids_orange} XP`,
  `Green: ${BELT_POINTS.kids_green} XP`,
].join('\n');

export default function HitListScreen() {
  const router = useRouter();
  const {
    addMedia,
    addQuickNote,
    addStandaloneHit,
    error,
    finishSkillPackOnboarding,
    hits,
    importPacks,
    loading,
    partners,
    reload,
    skillPackImports,
    skillPackOnboardingCompleted,
    skills,
    toggleActive,
  } = useHitList();
  const { toastMessage, showToast } = useToast();
  const [actionSkill, setActionSkill] = useState<Skill | null>(null);
  const [menuSkill, setMenuSkill] = useState<Skill | null>(null);
  const activeSkills = skills
    .filter((skill) => skill.active)
    .sort(compareActiveSkills);
  const hitsBySkill = hits.reduce<Record<string, number>>((totals, hit) => {
    totals[hit.skillId] = (totals[hit.skillId] ?? 0) + hit.count;
    return totals;
  }, {});
  const skillHits = hits.reduce<Record<string, Hit[]>>((bySkill, hit) => {
    (bySkill[hit.skillId] ??= []).push(hit);
    return bySkill;
  }, {});

  if (loading || error) {
    return (
      <Screen title="Hit List" titleIcon="gps-fixed" subtitle={activeSkillsHelp}>
        <View style={styles.stateStack}>
          <EmptyState
            title={loading ? 'Loading your Hit List' : 'Could not load your Hit List'}
            body={error ?? 'Syncing your skills, hits, and training logs.'}
          />
          {error ? <Button label="Retry" onPress={reload} variant="secondary" /> : null}
        </View>
      </Screen>
    );
  }

  if (skills.length === 0 && !skillPackOnboardingCompleted) {
    return (
      <Screen
        title="Skill Packs"
        titleIcon="inventory"
        subtitle="Choose curated skills to add now. Active skills appear on your Hit List; Arsenal skills are saved for later."
        toastMessage={toastMessage}
        scroll={false}
      >
        <SkillPackPicker
          importedPackSlugs={skillPackImports.map((item) => item.packSlug)}
          showSkip
          onImport={async (selections) => {
            try {
              await importPacks(selections);
              showToast('Skill pack added');
            } catch {
              showToast('Could not add skill pack');
            }
          }}
          onSkip={async () => {
            try {
              await finishSkillPackOnboarding();
              showToast('Starting empty');
            } catch {
              showToast('Could not save preference');
            }
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Hit List"
      titleIcon="gps-fixed"
      subtitle={activeSkillsHelp}
      toastMessage={toastMessage}
    >
      <>
        <View style={styles.list}>
          {activeSkills.length === 0 ? (
            <EmptyState
              title="Nothing on your Hit List yet"
              body="Activate skills from the Arsenal to add them to your Hit List."
            />
          ) : (
            activeSkills.map((skill) => (
              <ActiveSkillTile
                key={skill.id}
                hitCount={hitsBySkill[skill.id] ?? 0}
                xpFifths={skillXpFifths(skillHits[skill.id] ?? [], partners)}
                skill={skill}
                onLogPress={() => setActionSkill(skill)}
                onMenuPress={() => setMenuSkill(skill)}
              />
            ))
          )}
        </View>
        <QuickAddEntrySheet
          visible={actionSkill !== null}
          title={actionSkill?.name}
          partners={partners}
          onClose={() => setActionSkill(null)}
          onTrainingLog={() => {
            if (actionSkill) router.push(`/log/${actionSkill.id}`);
          }}
          onSaveHit={async ({ partnerName, count }) => {
            if (!actionSkill) return;
            try {
              await addStandaloneHit({ skillId: actionSkill.id, partnerName, count });
              showToast('Hit logged');
            } catch {
              showToast('Could not log hit');
            }
          }}
          onSaveMedia={async ({ url, notes }) => {
            if (!actionSkill) return;
            try {
              await addMedia({ skillId: actionSkill.id, url, notes });
              showToast('Media added');
            } catch {
              showToast('Could not add media');
            }
          }}
          onSaveNote={async (body) => {
            if (!actionSkill) return;
            try {
              await addQuickNote(actionSkill.id, body);
              showToast('Note added');
            } catch {
              showToast('Could not add note');
            }
          }}
        />
        <BottomSheetMenu
          visible={menuSkill !== null}
          title={menuSkill?.name}
          onRequestClose={() => setMenuSkill(null)}
          items={
            menuSkill
              ? [
                  {
                    key: 'log',
                    label: 'Log Training',
                    onPress: () => router.push(`/log/${menuSkill.id}`),
                  },
                  {
                    key: 'detail',
                    label: 'View Skill',
                    onPress: () => router.push(`/skills/${menuSkill.id}`),
                  },
                  {
                    key: 'deactivate',
                    label: 'Deactivate',
                    destructive: true,
                    onPress: async () => {
                      try {
                        await toggleActive(menuSkill.id);
                        showToast('Skill deactivated');
                      } catch {
                        showToast('Could not update skill');
                      }
                    },
                  },
                ]
              : []
          }
        />
      </>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    paddingBottom: spacing.xxl,
    rowGap: spacing.md,
  },
  stateStack: {
    gap: spacing.md,
  },
});

const activeSkillOrderByName = buildActiveSkillOrderByName();

function compareActiveSkills(a: Skill, b: Skill) {
  const aHighGroundOrder = getHighGroundSkillOrder(a.name);
  const bHighGroundOrder = getHighGroundSkillOrder(b.name);

  if (aHighGroundOrder !== undefined && bHighGroundOrder !== undefined) {
    return aHighGroundOrder - bHighGroundOrder;
  }

  if (aHighGroundOrder !== undefined) return -1;
  if (bHighGroundOrder !== undefined) return 1;

  const aOrder = activeSkillOrderByName.get(normalizeSkillName(a.name));
  const bOrder = activeSkillOrderByName.get(normalizeSkillName(b.name));

  if (aOrder !== undefined && bOrder !== undefined && aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  if (aOrder !== undefined) return -1;
  if (bOrder !== undefined) return 1;

  return Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt);
}

function buildActiveSkillOrderByName() {
  const orderByName = new Map<string, number>();

  for (const pack of skillPacks) {
    const orderedSkills = orderPackSkillsForTwoColumnGrid(pack.skills);

    for (const skill of orderedSkills) {
      orderByName.set(normalizeSkillName(skill.name), orderByName.size);
    }
  }

  orderByName.set(normalizeSkillName('Chest Wrap -> Reverse Half Nelson'), orderByName.get(normalizeSkillName('High Ground to Reverse Half Nelson')) ?? orderByName.size);
  orderByName.set(normalizeSkillName('Chest Wrap -> Reverse Donkey'), orderByName.get(normalizeSkillName('High Ground to Reverse Donkey')) ?? orderByName.size);

  return orderByName;
}

function orderPackSkillsForTwoColumnGrid(skills: SkillPackSkill[]) {
  if (!skills.some((skill) => skill.column)) return skills;

  const columns: SkillPackSkill[][] = [];
  const columnIndexByName = new Map<string, number>();

  for (const skill of skills) {
    const columnName = skill.column ?? 'Other';
    let columnIndex = columnIndexByName.get(columnName);

    if (columnIndex === undefined) {
      columnIndex = columns.length;
      columnIndexByName.set(columnName, columnIndex);
      columns.push([]);
    }

    columns[columnIndex].push(skill);
  }

  const orderedSkills: SkillPackSkill[] = [];
  const rowCount = Math.max(...columns.map((column) => column.length));

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (const column of columns) {
      const skill = column[rowIndex];
      if (skill) orderedSkills.push(skill);
    }
  }

  return orderedSkills;
}

function normalizeSkillName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function getHighGroundSkillOrder(name: string) {
  const normalizedName = normalizeSkillName(name);

  if (normalizedName.includes('reverse half') && isHighGroundEntry(normalizedName)) return 0;
  if (normalizedName.includes('reverse donkey') && isHighGroundEntry(normalizedName)) return 1;
  if (normalizedName.includes('seated kata gatame')) return 2;
  if (normalizedName.includes('ankle lock')) return 3;
  if (normalizedName.includes("d'arce")) return 4;
  if (normalizedName.includes('triangle')) return 5;

  return undefined;
}

function isHighGroundEntry(normalizedName: string) {
  return normalizedName.includes('high ground') || normalizedName.includes('chest wrap');
}

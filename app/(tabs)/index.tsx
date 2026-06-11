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
import { useHitList } from '../../lib/store';
import { spacing } from '../../lib/theme';
import type { Skill } from '../../lib/types';
import { useToast } from '../../lib/useToast';

const activeSkillsHelp = [
  "Your Hit List is the handful of skills you're hunting right now.",
  '',
  '+ opens add menu.',
  '... opens actions.',
  'Inner ring: progress toward Level 10.',
  'Outer ring: progress toward next level (hits).',
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
    .sort((a, b) => Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt));
  const hitsBySkill = hits.reduce<Record<string, number>>((totals, hit) => {
    totals[hit.skillId] = (totals[hit.skillId] ?? 0) + hit.count;
    return totals;
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

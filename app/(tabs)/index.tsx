import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActiveSkillTile } from '../../components/ActiveSkillTile';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useHitList } from '../../lib/store';
import { spacing } from '../../lib/theme';
import type { Skill } from '../../lib/types';
import { useToast } from '../../lib/useToast';

const activeSkillsHelp = [
  "Active Skills are the set of skills you're currently working on.",
  '',
  '+ logs training.',
  '... opens actions.',
  'Inner ring: progress toward Level 10.',
  'Outer ring: progress toward next level (hits).',
].join('\n');

export default function ActiveSkillsScreen() {
  const router = useRouter();
  const { hits, skills, toggleActive } = useHitList();
  const { toastMessage, showToast } = useToast();
  const [menuSkill, setMenuSkill] = useState<Skill | null>(null);
  const activeSkills = skills
    .filter((skill) => skill.active)
    .sort((a, b) => Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt));
  const hitsBySkill = hits.reduce<Record<string, number>>((totals, hit) => {
    totals[hit.skillId] = (totals[hit.skillId] ?? 0) + hit.count;
    return totals;
  }, {});

  return (
    <Screen
      title="Active Skills"
      titleIcon="sports-kabaddi"
      subtitle={activeSkillsHelp}
      toastMessage={toastMessage}
    >
      <>
        <View style={styles.list}>
          {activeSkills.length === 0 ? (
            <EmptyState
              title="No active skills yet"
              body="Activate skills from the Arsenal to make them show up here."
            />
          ) : (
            activeSkills.map((skill) => (
              <ActiveSkillTile
                key={skill.id}
                hitCount={hitsBySkill[skill.id] ?? 0}
                skill={skill}
                onLogPress={() => router.push(`/log/${skill.id}`)}
                onMenuPress={() => setMenuSkill(skill)}
              />
            ))
          )}
        </View>
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
                    onPress: () => {
                      toggleActive(menuSkill.id);
                      showToast('Skill deactivated');
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
    rowGap: spacing.md,
  },
});

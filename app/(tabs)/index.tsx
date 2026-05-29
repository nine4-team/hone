import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActiveSkillTile } from '../../components/ActiveSkillTile';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { EmptyState } from '../../components/EmptyState';
import { HitEntrySheet, MediaEntrySheet, NoteEntrySheet } from '../../components/EntrySheets';
import { Screen } from '../../components/Screen';
import { useHitList } from '../../lib/store';
import { spacing } from '../../lib/theme';
import type { Skill } from '../../lib/types';
import { useToast } from '../../lib/useToast';

const activeSkillsHelp = [
  "Active Skills are the set of skills you're currently working on.",
  '',
  '+ opens add menu.',
  '... opens actions.',
  'Inner ring: progress toward Level 10.',
  'Outer ring: progress toward next level (hits).',
].join('\n');

export default function ActiveSkillsScreen() {
  const router = useRouter();
  const { addMedia, addQuickNote, addStandaloneHit, hits, partners, skills, toggleActive } = useHitList();
  const { toastMessage, showToast } = useToast();
  const [actionSkill, setActionSkill] = useState<Skill | null>(null);
  const [hitSheetSkill, setHitSheetSkill] = useState<Skill | null>(null);
  const [mediaSheetSkill, setMediaSheetSkill] = useState<Skill | null>(null);
  const [menuSkill, setMenuSkill] = useState<Skill | null>(null);
  const [noteSheetSkill, setNoteSheetSkill] = useState<Skill | null>(null);
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
                onLogPress={() => setActionSkill(skill)}
                onMenuPress={() => setMenuSkill(skill)}
              />
            ))
          )}
        </View>
        <BottomSheetMenu
          visible={actionSkill !== null}
          title={actionSkill?.name}
          onRequestClose={() => setActionSkill(null)}
          items={
            actionSkill
              ? [
                  {
                    key: 'training-log',
                    label: 'Training Log',
                    onPress: () => router.push(`/log/${actionSkill.id}`),
                  },
                  {
                    key: 'hit',
                    label: 'Hit',
                    onPress: () => setHitSheetSkill(actionSkill),
                  },
                  {
                    key: 'media',
                    label: 'Media',
                    onPress: () => setMediaSheetSkill(actionSkill),
                  },
                  {
                    key: 'note',
                    label: 'Note',
                    onPress: () => setNoteSheetSkill(actionSkill),
                  },
                ]
              : []
          }
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
                    onPress: () => {
                      toggleActive(menuSkill.id);
                      showToast('Skill deactivated');
                    },
                  },
                ]
              : []
          }
        />
        <HitEntrySheet
          partners={partners}
          visible={hitSheetSkill !== null}
          onClose={() => setHitSheetSkill(null)}
          onSave={({ partnerName, count }) => {
            if (!hitSheetSkill) return;
            addStandaloneHit({ skillId: hitSheetSkill.id, partnerName, count });
            showToast('Hit logged');
          }}
        />
        <MediaEntrySheet
          visible={mediaSheetSkill !== null}
          onClose={() => setMediaSheetSkill(null)}
          onSave={async ({ url, notes }) => {
            if (!mediaSheetSkill) return;
            await addMedia({ skillId: mediaSheetSkill.id, url, notes });
            showToast('Media added');
          }}
        />
        <NoteEntrySheet
          visible={noteSheetSkill !== null}
          onClose={() => setNoteSheetSkill(null)}
          onSave={(body) => {
            if (!noteSheetSkill) return;
            addQuickNote(noteSheetSkill.id, body);
            showToast('Note added');
          }}
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

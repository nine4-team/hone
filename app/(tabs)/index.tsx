import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { useHone } from '../../lib/store';
import { spacing } from '../../lib/theme';
import { useToast } from '../../lib/useToast';

export default function ActiveScreen() {
  const router = useRouter();
  const { skills, toggleActive } = useHone();
  const { toastMessage, showToast } = useToast();
  const activeSkills = skills
    .filter((skill) => skill.active)
    .sort((a, b) => Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt));

  return (
    <Screen
      title="Active Skills"
      titleIcon="sports-kabaddi"
      subtitle="What you are paying attention to now."
      toastMessage={toastMessage}
    >
      <View style={styles.list}>
        {activeSkills.length === 0 ? (
          <EmptyState
            title="No active skills yet"
            body="Activate skills from the Pipeline or Library to make them show up here."
          />
        ) : (
          activeSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              showStage
              onLongPress={() => router.push(`/log/${skill.id}`)}
              onToggleActive={(nextActive) => {
                showToast(nextActive ? 'Skill activated' : 'Skill deactivated');
                toggleActive(skill.id);
              }}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});

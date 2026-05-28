import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { FormInput } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { useHone } from '../../lib/store';
import { spacing } from '../../lib/theme';
import { useToast } from '../../lib/useToast';

export default function LibraryScreen() {
  const { skills, toggleActive } = useHone();
  const [query, setQuery] = useState('');
  const { toastMessage, showToast } = useToast();

  const filteredSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return skills
      .filter((skill) => !normalized || skill.name.toLowerCase().includes(normalized))
      .sort((a, b) => Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt));
  }, [query, skills]);

  return (
    <Screen
      title="Library"
      titleIcon="search"
      subtitle="Find every skill, active or not."
      toastMessage={toastMessage}
    >
      <FormInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder="Search skills"
        style={styles.search}
        value={query}
      />
      <View style={styles.list}>
        {filteredSkills.length === 0 ? (
          <EmptyState title="No skills found" body="Try another search or create a new skill." />
        ) : (
          filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              showStage
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
  search: {
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
});

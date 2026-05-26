import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

export default function LibraryScreen() {
  const { skills, toggleActive } = useHone();
  const [query, setQuery] = useState('');

  const filteredSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return skills
      .filter((skill) => !normalized || skill.name.toLowerCase().includes(normalized))
      .sort((a, b) => Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt));
  }, [query, skills]);

  return (
    <Screen
      title="Library"
      subtitle="Find every skill, active or not."
    >
      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder="Search skills"
        placeholderTextColor={colors.quiet}
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
              onToggleActive={() => toggleActive(skill.id)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    marginBottom: spacing.lg,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
});

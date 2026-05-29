import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { FormInput } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { ArsenalIcon } from '../../components/ArsenalIcon';
import { getSkillLevelProgress } from '../../lib/hits';
import { useHone } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';
import { textStyles } from '../../lib/typography';
import { useToast } from '../../lib/useToast';

type ArsenalFilter = 'all' | 'equipped' | 'unequipped';
type ArsenalSort = 'level' | 'recent' | 'name';

export default function ArsenalScreen() {
  const { hits, skills, toggleActive } = useHone();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ArsenalFilter>('all');
  const [sort, setSort] = useState<ArsenalSort>('level');
  const { toastMessage, showToast } = useToast();

  const hitsBySkill = useMemo(
    () =>
      hits.reduce<Record<string, number>>((totals, hit) => {
        totals[hit.skillId] = (totals[hit.skillId] ?? 0) + hit.count;
        return totals;
      }, {}),
    [hits],
  );

  const filteredSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return skills
      .filter((skill) => !normalized || skill.name.toLowerCase().includes(normalized))
      .filter((skill) => {
        if (filter === 'equipped') return skill.active;
        if (filter === 'unequipped') return !skill.active;
        return true;
      })
      .sort((a, b) => {
        const aHits = hitsBySkill[a.id] ?? 0;
        const bHits = hitsBySkill[b.id] ?? 0;

        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'recent') return Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt);

        const aLevel = getSkillLevelProgress(aHits).level;
        const bLevel = getSkillLevelProgress(bHits).level;
        return (
          bLevel - aLevel ||
          bHits - aHits ||
          Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt)
        );
      });
  }, [filter, hitsBySkill, query, skills, sort]);

  return (
    <Screen
      title="Arsenal"
      titleIcon={ArsenalIcon}
      subtitle="Every skill you have saved, sorted by how developed it is."
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
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          {[
            ['all', 'All'],
            ['equipped', 'Equipped'],
            ['unequipped', 'Unequipped'],
          ].map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              selected={filter === value}
              onPress={() => setFilter(value as ArsenalFilter)}
            />
          ))}
        </View>
        <View style={styles.controlGroup}>
          {[
            ['level', 'Level'],
            ['recent', 'Recent'],
            ['name', 'Name'],
          ].map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              selected={sort === value}
              onPress={() => setSort(value as ArsenalSort)}
            />
          ))}
        </View>
      </View>
      <View style={styles.list}>
        {filteredSkills.length === 0 ? (
          <EmptyState title="No skills found" body="Try another search or create a new skill." />
        ) : (
          filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              hitCount={hitsBySkill[skill.id] ?? 0}
              skill={skill}
              onToggleActive={(nextActive) => {
                showToast(nextActive ? 'Skill equipped' : 'Skill unequipped');
                toggleActive(skill.id);
              }}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

function FilterChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    ...textStyles.formHelp,
    color: colors.muted,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.surface,
  },
  controlGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  controls: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  search: {
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
});

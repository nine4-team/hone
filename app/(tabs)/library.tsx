import { useMemo, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { EmptyState } from '../../components/EmptyState';
import { FormInput } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { ArsenalIcon } from '../../components/ArsenalIcon';
import { getSkillLevelProgress } from '../../lib/hits';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import { useToast } from '../../lib/useToast';

type ArsenalFilter = 'all' | 'active' | 'inactive';
type ArsenalSort = 'level' | 'active' | 'recent' | 'name';

const filterLabels: Record<ArsenalFilter, string> = {
  all: 'All',
  active: 'Active only',
  inactive: 'Inactive only',
};

const sortLabels: Record<ArsenalSort, string> = {
  level: 'Level',
  active: 'Active first',
  recent: 'Recent',
  name: 'Alphabetical',
};

export default function ArsenalScreen() {
  const { hits, skills, toggleActive } = useHone();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ArsenalFilter>('all');
  const [sort, setSort] = useState<ArsenalSort>('level');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
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
        if (filter === 'active') return skill.active;
        if (filter === 'inactive') return !skill.active;
        return true;
      })
      .sort((a, b) => {
        const aHits = hitsBySkill[a.id] ?? 0;
        const bHits = hitsBySkill[b.id] ?? 0;

        const aLevel = getSkillLevelProgress(aHits).level;
        const bLevel = getSkillLevelProgress(bHits).level;

        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'recent') return Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt);
        if (sort === 'active') {
          return (
            Number(b.active) - Number(a.active) ||
            bLevel - aLevel ||
            bHits - aHits ||
            Date.parse(b.lastTouchedAt) - Date.parse(a.lastTouchedAt)
          );
        }

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
      <View style={styles.searchToolbar}>
        <FormInput
          autoCapitalize="none"
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search skills"
          style={styles.search}
          value={query}
        />
        <IconOnlyControl
          accessibilityLabel={`Filter skills: ${filterLabels[filter]}`}
          icon="filter-list"
          onPress={() => setFilterMenuOpen(true)}
          selected={filter !== 'all'}
        />
        <IconOnlyControl
          accessibilityLabel={`Sort skills: ${sortLabels[sort]}`}
          icon="swap-vert"
          onPress={() => setSortMenuOpen(true)}
          selected={sort !== 'level'}
        />
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
                showToast(nextActive ? 'Skill activated' : 'Skill deactivated');
                toggleActive(skill.id);
              }}
            />
          ))
        )}
      </View>
      <BottomSheetMenu
        visible={filterMenuOpen}
        title="Filter skills"
        onRequestClose={() => setFilterMenuOpen(false)}
        items={(Object.keys(filterLabels) as ArsenalFilter[]).map((key) => ({
          key,
          label: filterLabels[key],
          selected: filter === key,
          onPress: () => setFilter(key),
        }))}
      />
      <BottomSheetMenu
        visible={sortMenuOpen}
        title="Sort skills"
        onRequestClose={() => setSortMenuOpen(false)}
        items={(Object.keys(sortLabels) as ArsenalSort[]).map((key) => ({
          key,
          label: sortLabels[key],
          selected: sort === key,
          onPress: () => setSort(key),
        }))}
      />
    </Screen>
  );
}

function IconOnlyControl({
  accessibilityLabel,
  icon,
  onPress,
  selected,
}: {
  accessibilityLabel: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconControl,
        selected && styles.iconControlSelected,
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons name={icon} size={22} color={selected ? colors.surface : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconControl: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  iconControlSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  search: {
    flex: 1,
    minWidth: 0,
  },
  searchToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
});

import { useMemo, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomSheetMenu } from '../../components/BottomSheetMenu';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { FormInput } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { ArsenalIcon } from '../../components/ArsenalIcon';
import { getSkillLevelProgress, skillXpFifths } from '../../lib/hits';
import { useHitList } from '../../lib/store';
import type { Hit } from '../../lib/types';
import { radius, spacing, useTheme } from '../../lib/theme';
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
  const { error, hits, loading, partners, reload, skills, toggleActive } = useHitList();
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

  // XP per skill (in fifths) for level/sort. Belt-weighted, so it can outpace
  // the raw hit count once colored-belt partners are involved.
  const xpFifthsBySkill = useMemo(() => {
    const grouped = hits.reduce<Record<string, Hit[]>>((bySkill, hit) => {
      (bySkill[hit.skillId] ??= []).push(hit);
      return bySkill;
    }, {});

    return Object.entries(grouped).reduce<Record<string, number>>((totals, [skillId, skillHits]) => {
      totals[skillId] = skillXpFifths(skillHits, partners);
      return totals;
    }, {});
  }, [hits, partners]);

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

        const aLevel = getSkillLevelProgress(xpFifthsBySkill[a.id] ?? 0).level;
        const bLevel = getSkillLevelProgress(xpFifthsBySkill[b.id] ?? 0).level;

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
  }, [filter, hitsBySkill, query, skills, sort, xpFifthsBySkill]);

  if (loading || error) {
    return (
      <Screen
        title="Arsenal"
        titleIcon={ArsenalIcon}
        subtitle="Every skill you have saved, sorted by how developed it is."
      >
        <View style={styles.stateStack}>
          <EmptyState
            title={loading ? 'Loading your Arsenal' : 'Could not load your Arsenal'}
            body={error ?? 'Syncing your saved skills.'}
          />
          {error ? <Button label="Retry" onPress={reload} variant="secondary" /> : null}
        </View>
      </Screen>
    );
  }

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
              xpFifths={xpFifthsBySkill[skill.id] ?? 0}
              skill={skill}
              onToggleActive={async (nextActive) => {
                try {
                  await toggleActive(skill.id);
                  showToast(nextActive ? 'Skill activated' : 'Skill deactivated');
                } catch {
                  showToast('Could not update skill');
                }
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
  const colors = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconControl,
        { backgroundColor: colors.surface, borderColor: colors.line },
        selected && { backgroundColor: colors.ink, borderColor: colors.ink },
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
    borderRadius: radius.md,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
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
  stateStack: {
    gap: spacing.md,
  },
});

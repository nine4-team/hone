import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { skillPacks, type SkillPackImportMode } from '../lib/starterSkills';
import { radius, spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Card } from './ui';

type SkillPackPickerProps = {
  importedPackSlugs: string[];
  onImport: (selections: Array<{ packSlug: string; importMode: SkillPackImportMode }>) => Promise<void>;
  onSkip?: () => Promise<void>;
  showSkip?: boolean;
};

type Selection = {
  selected: boolean;
  importMode: SkillPackImportMode;
};

export function SkillPackPicker({
  importedPackSlugs,
  onImport,
  onSkip,
  showSkip,
}: SkillPackPickerProps) {
  const colors = useTheme();
  const imported = useMemo(() => new Set(importedPackSlugs), [importedPackSlugs]);
  const [submitting, setSubmitting] = useState(false);
  const [expandedPacks, setExpandedPacks] = useState<Record<string, boolean>>({});
  const [selections, setSelections] = useState<Record<string, Selection>>(() =>
    Object.fromEntries(
      skillPacks.map((pack) => [
        pack.slug,
        { importMode: 'active' satisfies SkillPackImportMode, selected: !imported.has(pack.slug) },
      ]),
    ),
  );

  const selectedImports = skillPacks
    .filter((pack) => !imported.has(pack.slug) && selections[pack.slug]?.selected)
    .map((pack) => ({
      importMode: selections[pack.slug]?.importMode ?? 'active',
      packSlug: pack.slug,
    }));

  const availableCount = skillPacks.filter((pack) => !imported.has(pack.slug)).length;

  async function submitImport() {
    if (selectedImports.length === 0) return;
    setSubmitting(true);
    try {
      await onImport(selectedImports);
    } finally {
      setSubmitting(false);
    }
  }

  async function skip() {
    if (!onSkip) return;
    setSubmitting(true);
    try {
      await onSkip();
    } finally {
      setSubmitting(false);
    }
  }

  if (availableCount === 0) {
    return (
      <EmptyState
        title="All packs loaded"
        body="Every available skill pack has already been added to your account."
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        contentContainerStyle={styles.packList}
        showsVerticalScrollIndicator={false}
        style={styles.packScroller}
      >
        {skillPacks.map((pack) => {
          const isImported = imported.has(pack.slug);
          const selection = selections[pack.slug] ?? { importMode: 'active', selected: false };
          const isExpanded = expandedPacks[pack.slug] ?? false;

          return (
            <Card
              key={pack.slug}
              accessibilityLabel={`${pack.title}, ${pack.skills.length} skills`}
              style={[
                styles.packCard,
                selection.selected && !isImported && { borderColor: colors.sage },
                isImported && { opacity: 0.68 },
              ]}
            >
              <View style={styles.cardHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${selection.selected ? 'Deselect' : 'Select'} ${pack.title}`}
                  accessibilityState={{ selected: selection.selected }}
                  onPress={
                    isImported
                      ? undefined
                      : () =>
                          setSelections((current) => ({
                            ...current,
                            [pack.slug]: {
                              ...selection,
                              selected: !selection.selected,
                            },
                          }))
                  }
                  style={({ pressed }) => [
                    styles.cardTitleBlock,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.packTitle, { color: colors.ink }]}>{pack.title}</Text>
                  <Text style={[styles.packMeta, { color: colors.muted }]}>
                    {formatSkillCount(pack.skills.length)} - {pack.level}
                  </Text>
                </Pressable>
                <View style={styles.headerActions}>
                  <MaterialIcons
                    name={
                      isImported || selection.selected ? 'check-circle' : 'radio-button-unchecked'
                    }
                    size={24}
                    color={isImported || selection.selected ? colors.sage : colors.quiet}
                  />
                </View>
              </View>
              <Text style={[styles.description, { color: colors.muted }]}>
                {pack.description}
              </Text>
              <Pressable
                accessibilityLabel={`${isExpanded ? 'Hide' : 'Show'} skills in ${pack.title}`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                hitSlop={8}
                onPress={() =>
                  setExpandedPacks((current) => ({
                    ...current,
                    [pack.slug]: !isExpanded,
                  }))
                }
                style={({ pressed }) => [styles.skillsHeader, pressed && styles.pressed]}
              >
                <Text style={[styles.skillsHeaderLabel, { color: colors.muted }]}>
                  Skills in pack
                </Text>
                <MaterialIcons
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  size={22}
                  color={colors.muted}
                />
              </Pressable>
              {isExpanded ? (
                <View style={[styles.skillList, { backgroundColor: colors.bg }]}>
                  {pack.skills.map((skill) => (
                    <View key={skill.key} style={styles.skillRow}>
                      <Text style={[styles.skillName, { color: colors.ink }]}>{skill.name}</Text>
                      <Text style={[styles.skillMeta, { color: colors.muted }]}>
                        {formatMediaCount(skill.media.length)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {isImported ? (
                <Text style={[styles.importedLabel, { color: colors.sage }]}>Imported</Text>
              ) : selection.selected ? (
                <View style={styles.destinationBlock}>
                  <Text style={[styles.destinationLabel, { color: colors.muted }]}>Add to</Text>
                  <View style={[styles.modeControl, { backgroundColor: colors.bg }]}>
                    <ModeButton
                      label="Hit List"
                      selected={selection.importMode === 'active'}
                      onPress={() =>
                        setSelections((current) => ({
                          ...current,
                          [pack.slug]: { ...selection, importMode: 'active' },
                        }))
                      }
                    />
                    <ModeButton
                      label="Arsenal"
                      selected={selection.importMode === 'arsenal'}
                      onPress={() =>
                        setSelections((current) => ({
                          ...current,
                          [pack.slug]: { ...selection, importMode: 'arsenal' },
                        }))
                      }
                    />
                  </View>
                  <Text style={[styles.destinationHelp, { color: colors.muted }]}>
                    {selection.importMode === 'active'
                      ? 'Shows on your Hit List now.'
                      : 'Saved for later and hidden from the Hit List.'}
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
      <View style={[styles.actions, { backgroundColor: colors.bg, borderTopColor: colors.line }]}>
        <Button
          label={submitting ? 'Adding Packs...' : `Add ${selectedImports.length} Pack${selectedImports.length === 1 ? '' : 's'}`}
          onPress={submitImport}
          style={styles.actionButton}
        />
        {showSkip && onSkip ? (
          <Button label="Start Empty" onPress={skip} style={styles.actionButton} variant="secondary" />
        ) : null}
      </View>
    </View>
  );
}

function formatSkillCount(count: number) {
  return `${count} ${count === 1 ? 'skill' : 'skills'}`;
}

function ModeButton({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [
        styles.modeButton,
        selected && { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.modeLabel, { color: selected ? colors.ink : colors.muted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 16,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    zIndex: 16,
  },
  actionButton: {
    flex: 1,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cardTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  expandButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 28,
  },
  description: {
    ...textStyles.detailRecordBody,
  },
  destinationBlock: {
    gap: spacing.xs,
  },
  destinationHelp: {
    ...textStyles.formHelp,
  },
  destinationLabel: {
    ...textStyles.rowLabel,
  },
  importedLabel: {
    ...textStyles.formLabel,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  skillList: {
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.md,
  },
  skillMeta: {
    ...textStyles.listRowMeta,
  },
  skillName: {
    ...textStyles.menuItem,
    flex: 1,
    minWidth: 0,
  },
  skillRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  skillsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillsHeaderLabel: {
    ...textStyles.rowLabel,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  modeControl: {
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  modeLabel: {
    ...textStyles.buttonLabelCompact,
  },
  packCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  packList: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  packScroller: {
    flex: 1,
  },
  packMeta: {
    ...textStyles.listRowMeta,
    marginTop: 2,
  },
  packTitle: {
    ...textStyles.skillCardName,
  },
  pressed: {
    opacity: 0.72,
  },
  wrap: {
    flex: 1,
    marginHorizontal: -spacing.lg,
  },
});

function formatMediaCount(count: number) {
  return `${count} media item${count === 1 ? '' : 's'}`;
}

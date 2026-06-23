import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActivationSwitch } from './ActivationSwitch';
import { formatRelative } from '../lib/format';
import { formatXp, getSkillLevelProgress } from '../lib/hits';
import { spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { Skill } from '../lib/types';
import { Card, HeaderActionSlot } from './ui';

type SkillCardProps = {
  hitCount?: number;
  xpFifths?: number;
  skill: Skill;
  onToggleActive?: (nextActive: boolean) => void;
  onLongPress?: () => void;
};

export function SkillCard({
  hitCount = 0,
  xpFifths = 0,
  skill,
  onLongPress,
  onToggleActive,
}: SkillCardProps) {
  const router = useRouter();
  const colors = useTheme();
  const levelProgress = getSkillLevelProgress(xpFifths);
  const progressLabel = levelProgress.nextLevel
    ? `${formatXp(levelProgress.totalXp)} XP total · ${formatXp(levelProgress.xpToNextLevel)} XP to Level ${levelProgress.nextLevel}`
    : `${formatXp(levelProgress.totalXp)} XP total`;

  return (
    <Card
      accessibilityHint={onLongPress ? 'Long press to log training.' : undefined}
      accessibilityLabel={`${skill.name}, Level ${levelProgress.level}, ${hitCount} ${
        hitCount === 1 ? 'hit' : 'hits'
      }`}
      onLongPress={onLongPress}
      onPress={() => router.push(`/skills/${skill.id}`)}
      style={styles.cardContent}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, { color: colors.ink }]} numberOfLines={2}>
            {skill.name}
          </Text>
        </View>

        <HeaderActionSlot>
          {onToggleActive ? (
            <ActivationSwitch
              value={skill.active}
              onValueChange={(nextActive) => onToggleActive(nextActive)}
            />
          ) : null}
        </HeaderActionSlot>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.meta, { color: colors.quiet }]}>
          <Text style={[styles.metaStrong, { color: colors.muted }]}>Level {levelProgress.level}</Text>
          <Text> · </Text>
          {hitCount} {hitCount === 1 ? 'hit' : 'hits'}
          <Text> · </Text>
          {progressLabel}
        </Text>
        <Text style={[styles.meta, { color: colors.quiet }]}>
          <Text style={[styles.metaStrong, { color: colors.muted }]}>Last touched: </Text>
          {formatRelative(skill.lastTouchedAt)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footer: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 28,
  },
  meta: {
    ...textStyles.skillCardMetaValue,
  },
  metaStrong: {
    ...textStyles.skillCardMetaLabel,
  },
  name: {
    ...textStyles.skillCardName,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
});

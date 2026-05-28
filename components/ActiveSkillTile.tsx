import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatRelative, stageLabels } from '../lib/format';
import { colors, spacing } from '../lib/theme';
import type { Skill, SkillStage } from '../lib/types';

type ActiveSkillTileProps = {
  hitCount: number;
  onLogPress: () => void;
  onMenuPress: () => void;
  skill: Skill;
};

export function ActiveSkillTile({
  hitCount,
  onLogPress,
  onMenuPress,
  skill,
}: ActiveSkillTileProps) {
  const router = useRouter();
  const hitLabel = hitCount === 1 ? 'Hit' : 'Hits';
  const progressSides = stageProgressSides[skill.stage];

  return (
    <Pressable
      accessibilityHint="Opens skill details."
      accessibilityLabel={`${skill.name}, ${hitCount} ${hitLabel.toLowerCase()}`}
      accessibilityRole="button"
      onLongPress={onLogPress}
      onPress={() => router.push(`/skills/${skill.id}`)}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <Pressable
        accessibilityLabel={`Log training for ${skill.name}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onLogPress();
        }}
        style={({ pressed }) => [styles.logChip, pressed && styles.pressed]}
      >
        <MaterialIcons name="add" size={14} color={colors.ink} />
      </Pressable>

      <Pressable
        accessibilityLabel={`More options for ${skill.name}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onMenuPress();
        }}
        style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
      >
        <MaterialIcons name="more-horiz" size={18} color={colors.muted} />
      </Pressable>

      <View style={styles.ringTrack}>
        <View
          pointerEvents="none"
          style={[
            styles.ringProgress,
            progressSides >= 1 && styles.ringTop,
            progressSides >= 2 && styles.ringRight,
            progressSides >= 3 && styles.ringBottom,
            progressSides >= 4 && styles.ringLeft,
          ]}
        />
        <View style={styles.ringInner}>
          <Text style={styles.hitCount} numberOfLines={1}>
            {hitCount}
          </Text>
          <Text style={styles.hitLabel} numberOfLines={1}>
            {hitLabel.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {skill.name.toUpperCase()}
      </Text>
      <View style={styles.metaStack}>
        <Text style={styles.meta} numberOfLines={1}>
          <Text style={styles.metaLabel}>Stage: </Text>
          {stageLabels[skill.stage]}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          <Text style={styles.metaLabel}>Last touched: </Text>
          {formatRelative(skill.lastTouchedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const RING_SIZE = 120;
const RING_STROKE = 10;

const stageProgressSides: Record<SkillStage, number> = {
  saved: 1,
  mechanics: 2,
  resistance: 3,
  proven: 4,
};

const styles = StyleSheet.create({
  hitCount: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
    includeFontPadding: false,
  },
  hitLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
    marginTop: 2,
  },
  logChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 2,
    left: spacing.sm,
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    top: spacing.xs,
    zIndex: 2,
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  metaStack: {
    gap: 1,
    marginTop: -spacing.xs,
  },
  menuButton: {
    opacity: 0.5,
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    zIndex: 2,
  },
  name: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  ringBottom: {
    borderBottomColor: colors.sage,
  },
  ringInner: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 42,
    borderWidth: StyleSheet.hairlineWidth,
    height: 84,
    justifyContent: 'center',
    width: 84,
    zIndex: 1,
  },
  ringLeft: {
    borderLeftColor: colors.sage,
  },
  ringProgress: {
    borderBottomColor: 'transparent',
    borderColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRadius: RING_SIZE / 2,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: RING_STROKE,
    height: RING_SIZE,
    position: 'absolute',
    width: RING_SIZE,
  },
  ringRight: {
    borderRightColor: colors.sage,
  },
  ringTop: {
    borderTopColor: colors.sage,
  },
  ringTrack: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    height: RING_SIZE,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    width: RING_SIZE,
  },
  tile: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 214,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
    position: 'relative',
    width: '50%',
  },
});

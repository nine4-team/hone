import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { getSkillLevelProgress } from '../lib/hits';
import { colors, spacing } from '../lib/theme';
import type { Skill } from '../lib/types';

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
  const levelProgress = getSkillLevelProgress(hitCount);
  const currentLevelHitLabel = levelProgress.hitsIntoLevel === 1 ? 'HIT' : 'HITS';
  const totalHitLabel = hitCount === 1 ? 'hit' : 'hits';
  const lifetimeHitLabel = hitCount === 1 ? 'lifetime hit' : 'lifetime hits';
  const hitRing = getRingStroke(HIT_RING_RADIUS, levelProgress.progressToNextLevel);
  const levelRing = getRingStroke(LEVEL_RING_RADIUS, levelProgress.level / 10);
  const nextLevelHitLabel = `${levelProgress.hitsToNextLevel} ${
    levelProgress.hitsToNextLevel === 1 ? 'hit' : 'hits'
  }`;

  return (
    <View style={styles.tile}>
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

      <Pressable
        accessibilityHint="Opens skill details."
        accessibilityLabel={`${skill.name}, Level ${levelProgress.level}, ${hitCount} ${totalHitLabel}`}
        accessibilityRole="button"
        onLongPress={onLogPress}
        onPress={() => router.push(`/skills/${skill.id}`)}
        style={({ pressed }) => [styles.tilePressArea, pressed && styles.pressed]}
      >
        <View style={styles.ringTrack}>
          <Svg height={RING_SIZE} pointerEvents="none" style={styles.ringSvg} width={RING_SIZE}>
            <G transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}>
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={HIT_RING_RADIUS}
                stroke={colors.line}
                strokeWidth={HIT_RING_STROKE}
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={HIT_RING_RADIUS}
                stroke={colors.sage}
                strokeDasharray={`${hitRing.circumference}, ${hitRing.circumference}`}
                strokeDashoffset={hitRing.offset}
                strokeLinecap="butt"
                strokeWidth={HIT_RING_STROKE}
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={LEVEL_RING_RADIUS}
                stroke={LEVEL_RING_TRACK_COLOR}
                strokeWidth={LEVEL_RING_STROKE}
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={LEVEL_RING_RADIUS}
                stroke={LEVEL_RING_PROGRESS_COLOR}
                strokeDasharray={`${levelRing.circumference}, ${levelRing.circumference}`}
                strokeDashoffset={levelRing.offset}
                strokeLinecap="butt"
                strokeWidth={LEVEL_RING_STROKE}
              />
            </G>
          </Svg>
          <View style={styles.ringInner}>
            <Text style={[styles.dialMetric, styles.dialMetricHits]} numberOfLines={1}>
              {levelProgress.hitsIntoLevel}
              <Text style={[styles.dialMetricLabel, styles.dialMetricHits]}>
                {` ${currentLevelHitLabel}`}
              </Text>
            </Text>
            <Text style={[styles.dialMetric, styles.dialMetricLevel]} numberOfLines={1}>
              <Text style={[styles.dialMetricLabel, styles.dialMetricLevelLabel]}>LEVEL </Text>
              {levelProgress.level}
            </Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {skill.name.toUpperCase()}
        </Text>
        <View style={styles.metaStack}>
          <Text style={styles.meta} numberOfLines={1}>
            {levelProgress.nextLevel ? (
              <>
                <Text style={styles.metaLabel}>{nextLevelHitLabel}</Text>
                {` until Level ${levelProgress.nextLevel}`}
              </>
            ) : (
              <>
                <Text style={styles.metaLabel}>{hitCount} lifetime hits</Text>
              </>
            )}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            <Text style={styles.metaLabel}>{hitCount}</Text>
            {` ${lifetimeHitLabel}`}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const RING_SIZE = 120;
const RING_CENTER = RING_SIZE / 2;
const HIT_RING_RADIUS = 55;
const HIT_RING_STROKE = 8;
const LEVEL_RING_RADIUS = 47;
const LEVEL_RING_STROKE = 8;
const LEVEL_RING_TRACK_COLOR = '#ECECEC';
const LEVEL_RING_PROGRESS_COLOR = '#666666';

function getRingStroke(radius: number, progress: number) {
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = Math.max(0, Math.min(1, progress));

  return {
    circumference,
    offset: circumference * (1 - normalizedProgress),
  };
}

const styles = StyleSheet.create({
  dialMetric: {
    color: LEVEL_RING_PROGRESS_COLOR,
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 18,
  },
  dialMetricHits: {
    color: colors.sage,
  },
  dialMetricLevel: {
    color: LEVEL_RING_PROGRESS_COLOR,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  dialMetricLevelLabel: {
    fontWeight: '500',
  },
  dialMetricLabel: {
    fontWeight: '600',
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
  ringSvg: {
    position: 'absolute',
  },
  ringTrack: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RING_SIZE / 2,
    height: RING_SIZE,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    width: RING_SIZE,
  },
  tile: {
    minHeight: 214,
    position: 'relative',
    width: '50%',
  },
  tilePressArea: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 214,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
    width: '100%',
  },
});

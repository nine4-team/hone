import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { getSkillLevelProgress } from '../lib/hits';
import { spacing, useTheme } from '../lib/theme';
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
  const colors = useTheme();
  const levelProgress = getSkillLevelProgress(hitCount);
  const currentLevelHitLabel = levelProgress.hitsIntoLevel === 1 ? 'HIT' : 'HITS';
  const totalHitLabel = hitCount === 1 ? 'hit' : 'hits';
  const lifetimeHitLabel = hitCount === 1 ? 'lifetime hit' : 'lifetime hits';
  const hitRing = getRingStroke(HIT_RING_RADIUS, levelProgress.progressToNextLevel);
  const levelRing = getRingStroke(LEVEL_RING_RADIUS, levelProgress.level / 10);
  const dialColors = colors.bg === DARK_PAGE_BACKGROUND ? darkDialColors : lightDialColors;
  const nextLevelHitLabel = `${levelProgress.hitsToNextLevel} ${
    levelProgress.hitsToNextLevel === 1 ? 'hit' : 'hits'
  }`;

  return (
    <View style={styles.tile}>
      <Pressable
        accessibilityLabel={`Open add menu for ${skill.name}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onLogPress();
        }}
        style={({ pressed }) => [
          styles.logChip,
          { backgroundColor: colors.surface, borderColor: colors.line },
          pressed && styles.pressed,
        ]}
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
        <View style={[styles.ringTrack, { backgroundColor: dialColors.center, shadowColor: colors.ink }]}>
          <Svg height={RING_SIZE} pointerEvents="none" style={styles.ringSvg} width={RING_SIZE}>
            <G transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}>
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={HIT_RING_RADIUS}
                stroke={dialColors.outerTrack}
                strokeWidth={HIT_RING_STROKE}
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={HIT_RING_RADIUS}
                stroke={dialColors.hitProgress}
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
                stroke={dialColors.innerTrack}
                strokeWidth={LEVEL_RING_STROKE}
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                fill="none"
                r={LEVEL_RING_RADIUS}
                stroke={dialColors.levelProgress}
                strokeDasharray={`${levelRing.circumference}, ${levelRing.circumference}`}
                strokeDashoffset={levelRing.offset}
                strokeLinecap="butt"
                strokeWidth={LEVEL_RING_STROKE}
              />
            </G>
          </Svg>
          <View style={[styles.ringInner, { backgroundColor: dialColors.center }]}>
            <Text style={[styles.dialMetric, { color: dialColors.hitProgress }]} numberOfLines={1}>
              {levelProgress.hitsIntoLevel}
              <Text style={[styles.dialMetricLabel, { color: dialColors.hitProgress }]}>
                {` ${currentLevelHitLabel}`}
              </Text>
            </Text>
            <Text style={[styles.dialMetric, styles.dialMetricLevel, { color: dialColors.levelProgress }]} numberOfLines={1}>
              <Text style={[styles.dialMetricLabel, styles.dialMetricLevelLabel, { color: dialColors.levelProgress }]}>LEVEL </Text>
              {levelProgress.level}
            </Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.ink }]} numberOfLines={1}>
          {skill.name.toUpperCase()}
        </Text>
        <View style={styles.metaStack}>
          <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
            {levelProgress.nextLevel ? (
              <>
                <Text style={[styles.metaLabel, { color: colors.muted }]}>{nextLevelHitLabel}</Text>
                {` until Level ${levelProgress.nextLevel}`}
              </>
            ) : (
              <>
                <Text style={[styles.metaLabel, { color: colors.muted }]}>{hitCount} lifetime hits</Text>
              </>
            )}
          </Text>
          <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
            <Text style={[styles.metaLabel, { color: colors.muted }]}>{hitCount}</Text>
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
const DARK_PAGE_BACKGROUND = '#1E1E1E';

const lightDialColors = {
  center: '#F7F8FA',
  outerTrack: '#E0E0E0',
  innerTrack: '#ECECEC',
  hitProgress: '#987E55',
  levelProgress: '#666666',
};

const darkDialColors = {
  center: '#1E1E1E',
  outerTrack: '#3F3F3F',
  innerTrack: '#353535',
  hitProgress: '#987E55',
  levelProgress: '#8A8A8A',
};

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
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 18,
  },
  dialMetricLevel: {
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
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
  },
  metaLabel: {
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
    borderRadius: 42,
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
    borderRadius: RING_SIZE / 2,
    height: RING_SIZE,
    justifyContent: 'center',
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

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivationSwitch } from './ActivationSwitch';
import { StageMeta } from './StageDisplay';
import { formatRelative } from '../lib/format';
import { spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { Skill } from '../lib/types';
import { Card, HeaderActionSlot } from './ui';

type SkillCardProps = {
  skill: Skill;
  showStage?: boolean;
  onToggleActive?: (nextActive: boolean) => void;
  onLongPress?: () => void;
};

export function SkillCard({
  skill,
  showStage = false,
  onLongPress,
  onToggleActive,
}: SkillCardProps) {
  const router = useRouter();

  return (
    <Card style={styles.cardContent}>
      <View style={styles.header}>
        <Pressable
          accessibilityHint={onLongPress ? 'Long press to log training.' : undefined}
          accessibilityRole="button"
          onLongPress={onLongPress}
          onPress={() => router.push(`/skills/${skill.id}`)}
          style={({ pressed }) => [styles.titleBlock, pressed && styles.pressed]}
        >
          <View>
            <Text style={styles.name} numberOfLines={2}>
              {skill.name}
            </Text>
          </View>
        </Pressable>

        <HeaderActionSlot>
          {onToggleActive ? (
            <ActivationSwitch
              value={skill.active}
              onValueChange={(nextActive) => onToggleActive(nextActive)}
            />
          ) : null}
        </HeaderActionSlot>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/skills/${skill.id}`)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.footer}>
          <Text style={styles.meta}>
            {showStage ? (
              <>
                <StageMeta stage={skill.stage} />
                <Text> · </Text>
              </>
            ) : null}
            <Text style={styles.metaStrong}>Last touched: </Text>
            {formatRelative(skill.lastTouchedAt)}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  pressed: {
    opacity: 0.72,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatRelative, stageLabels } from '../lib/format';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { Skill } from '../lib/types';
import { Card, HeaderActionSlot, IconButton } from './ui';

type SkillCardProps = {
  skill: Skill;
  showStage?: boolean;
  onToggleActive?: () => void;
  onLongPress?: () => void;
};

export function SkillCard({
  skill,
  showStage = false,
  onLongPress,
  onToggleActive,
}: SkillCardProps) {
  return (
    <Link href={`/skills/${skill.id}`} asChild>
      <Pressable
        accessibilityHint={onLongPress ? 'Long press to log training.' : undefined}
        accessibilityRole="button"
        onLongPress={onLongPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.name} numberOfLines={2}>
                {skill.name}
              </Text>
            </View>

            <HeaderActionSlot>
              {onToggleActive ? (
                <IconButton
                  accessibilityLabel={skill.active ? 'Deactivate skill' : 'Activate skill'}
                  onPress={onToggleActive}
                  selected={skill.active}
                >
                  <MaterialIcons
                    name="push-pin"
                    size={20}
                    color={skill.active ? colors.sage : colors.quiet}
                  />
                </IconButton>
              ) : null}
            </HeaderActionSlot>
          </View>

          <View style={styles.footer}>
            <Text style={styles.meta}>
              {showStage ? (
                <>
                  <Text style={styles.metaStrong}>Stage: </Text>
                  {stageLabels[skill.stage]}
                  <Text> · </Text>
                </>
              ) : null}
              <Text style={styles.metaStrong}>Last touched: </Text>
              {formatRelative(skill.lastTouchedAt)}
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
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

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SkillCard } from '../../components/SkillCard';
import { stageDescriptions, stageLabels, stages } from '../../lib/format';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

export default function PipelineScreen() {
  const { skills, toggleActive } = useHone();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Pipeline</Text>
        <Text style={styles.subtitle}>Saved, Mechanics, Resistance, Proven.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columns}>
        {stages.map((stage) => {
          const stageSkills = skills.filter((skill) => skill.stage === stage);

          return (
            <View key={stage} style={styles.column}>
              <Text style={styles.columnTitle}>{stageLabels[stage]}</Text>
              <Text style={styles.columnDescription}>{stageDescriptions[stage]}</Text>
              <View style={styles.cards}>
                {stageSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} onToggleActive={() => toggleActive(skill.id)} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  columns: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 128,
  },
  column: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    width: 304,
  },
  columnTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  columnDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cards: {
    gap: spacing.md,
  },
});

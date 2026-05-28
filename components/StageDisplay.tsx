import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InfoLabel } from './InfoLabel';
import { stageDescriptions, stageLabels, stages } from '../lib/format';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { SkillStage } from '../lib/types';

type StageSelectorProps = {
  onChange: (stage: SkillStage) => void;
  value: SkillStage;
};

export function StageSelector({ onChange, value }: StageSelectorProps) {
  return (
    <View style={styles.selector}>
      {stages.map((stage) => {
        const selected = value === stage;
        const stageIndex = stages.indexOf(stage);

        return (
          <Pressable
            key={stage}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(stage)}
            style={({ pressed }) => [styles.stageStep, pressed && styles.pressed]}
          >
            <View style={styles.stepTrack}>
              {stageIndex > 0 ? <View style={styles.stepLine} /> : <View style={styles.stepSpacer} />}
              <View style={[styles.stepDot, selected && styles.stepDotActive]} />
              {stageIndex < stages.length - 1 ? <View style={styles.stepLine} /> : <View style={styles.stepSpacer} />}
            </View>
            <Text style={[styles.stepLabel, selected && styles.stepLabelActive]}>{stageLabels[stage]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StageColumnHeader({ stage }: { stage: SkillStage }) {
  const label = stageLabels[stage];

  return (
    <View style={styles.columnHeader}>
      <View style={styles.columnTitleRow}>
        <InfoLabel
          label={label}
          body={stageDescriptions[stage]}
          infoSize={16}
          labelStyle={styles.columnTitle}
        />
      </View>
    </View>
  );
}

export function StageMeta({ stage }: { stage: SkillStage }) {
  return (
    <>
      <Text style={styles.metaLabel}>Stage: </Text>
      {stageLabels[stage]}
    </>
  );
}

const styles = StyleSheet.create({
  columnHeader: {
    marginBottom: spacing.md,
  },
  columnTitle: {
    ...textStyles.pipelineColumnTitle,
  },
  columnTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 24,
  },
  metaLabel: {
    ...textStyles.skillCardMetaLabel,
  },
  pressed: {
    opacity: 0.68,
  },
  selector: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  stageStep: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  stepDot: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  stepDotActive: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  stepLabel: {
    ...textStyles.stageLabel,
    textAlign: 'center',
  },
  stepLabelActive: {
    ...textStyles.stageLabelActive,
  },
  stepLine: {
    backgroundColor: colors.line,
    flex: 1,
    height: 1,
  },
  stepSpacer: {
    flex: 1,
    height: 1,
  },
  stepTrack: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
});

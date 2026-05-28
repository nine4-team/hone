import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { SkillCard } from '../../components/SkillCard';
import { StageColumnHeader, StageSelector } from '../../components/StageDisplay';
import { stages } from '../../lib/format';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import { useToast } from '../../lib/useToast';

export default function PipelineScreen() {
  const { skills, toggleActive } = useHone();
  const { toastMessage, showToast } = useToast();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const stagePageWidth = width - spacing.lg * 2;
  const snapInterval = stagePageWidth + spacing.md;
  const activeStage = stages[activeStageIndex] ?? stages[0];

  function handleStageChange(stage: (typeof stages)[number]) {
    const nextIndex = stages.indexOf(stage);
    if (nextIndex < 0) return;

    setActiveStageIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * snapInterval, animated: true });
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.max(
      0,
      Math.min(stages.length - 1, Math.round(event.nativeEvent.contentOffset.x / snapInterval)),
    );
    setActiveStageIndex(nextIndex);
  }

  return (
    <Screen
      title="Skill Pipeline"
      titleIcon="view-column"
      subtitle="Move skills through the stages of learning: saved ideas, mechanics, resistance, and proven execution."
      contentStyle={styles.pipelineContent}
      scroll={false}
      stickyHeader={<StageSelector value={activeStage} onChange={handleStageChange} />}
      toastMessage={toastMessage}
    >
      <ScrollView
        ref={scrollRef}
        decelerationRate="fast"
        disableIntervalMomentum
        horizontal
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToAlignment="start"
        snapToInterval={snapInterval}
        style={styles.pager}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columns}
      >
        {stages.map((stage) => {
          const stageSkills = skills.filter((skill) => skill.stage === stage);

          return (
            <View key={stage} style={[styles.column, { width: stagePageWidth }]}>
              <StageColumnHeader stage={stage} />
              <View style={styles.cards}>
                {stageSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onToggleActive={(nextActive) => {
                      showToast(nextActive ? 'Skill activated' : 'Skill deactivated');
                      toggleActive(skill.id);
                    }}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: spacing.md,
  },
  column: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    width: 304,
  },
  columns: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  pager: {
    flex: 1,
  },
  pipelineContent: {
    flex: 1,
  },
});

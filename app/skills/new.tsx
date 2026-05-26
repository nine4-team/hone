import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { stageLabels, stages } from '../../lib/format';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import type { SkillStage } from '../../lib/types';

export default function NewSkillScreen() {
  const router = useRouter();
  const { addSkill } = useHone();
  const [name, setName] = useState('');
  const [stage, setStage] = useState<SkillStage>('saved');
  const [active, setActive] = useState(true);

  return (
    <Screen title="New Skill" subtitle="Name is the only required field.">
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          autoFocus
          onChangeText={setName}
          placeholder="K guard entry"
          placeholderTextColor={colors.quiet}
          style={styles.input}
          value={name}
        />

        <Text style={styles.label}>Stage</Text>
        <View style={styles.segment}>
          {stages.map((item) => (
            <Button
              key={item}
              label={stageLabels[item]}
              onPress={() => setStage(item)}
              variant={stage === item ? 'primary' : 'secondary'}
            />
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Active</Text>
            <Text style={styles.help}>Show this skill on the Active Skills screen.</Text>
          </View>
          <Switch onValueChange={setActive} value={active} />
        </View>

        <Button
          label="Create Skill"
          onPress={() => {
            if (!name.trim()) return;
            const skill = addSkill({ name, stage, active });
            router.replace(`/skills/${skill.id}`);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  help: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
});

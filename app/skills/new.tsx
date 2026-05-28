import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivationSwitch } from '../../components/ActivationSwitch';
import { Button } from '../../components/Button';
import { FormHelp, FormInput, FormLabel, FormStack } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { StageSelector } from '../../components/StageDisplay';
import { Card } from '../../components/ui';
import { useHone } from '../../lib/store';
import { spacing } from '../../lib/theme';
import type { SkillStage } from '../../lib/types';

export default function NewSkillScreen() {
  const router = useRouter();
  const { addSkill } = useHone();
  const [name, setName] = useState('');
  const [stage, setStage] = useState<SkillStage>('saved');
  const [active, setActive] = useState(true);

  return (
    <Screen title="New Skill" subtitle="Name is the only required field." onBack={router.back}>
      <FormStack>
        <FormLabel>Name</FormLabel>
        <FormInput
          autoFocus
          onChangeText={setName}
          placeholder="K guard entry"
          value={name}
        />

        <FormLabel>Stage</FormLabel>
        <Card style={styles.stageSelector}>
          <StageSelector value={stage} onChange={setStage} />
        </Card>

        <Card style={styles.switchRow}>
          <View>
            <FormLabel>Active</FormLabel>
            <FormHelp>Show this skill on the Active Skills screen.</FormHelp>
          </View>
          <ActivationSwitch onValueChange={setActive} value={active} />
        </Card>

        <Button
          label="Create Skill"
          onPress={() => {
            if (!name.trim()) return;
            const skill = addSkill({ name, stage, active });
            router.replace(`/skills/${skill.id}`);
          }}
        />
      </FormStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  stageSelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});

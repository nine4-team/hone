import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivationSwitch } from '../../components/ActivationSwitch';
import { Button } from '../../components/Button';
import { FormHelp, FormInput, FormLabel, FormStack } from '../../components/FormControls';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/ui';
import { useHitList } from '../../lib/store';
import { spacing } from '../../lib/theme';

export default function NewSkillScreen() {
  const router = useRouter();
  const { addSkill } = useHitList();
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

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

        <Card style={styles.switchRow}>
          <View>
            <FormLabel>Active</FormLabel>
            <FormHelp>Show this skill on your Hit List.</FormHelp>
          </View>
          <ActivationSwitch onValueChange={setActive} value={active} />
        </Card>

        <Button
          label={saving ? 'Creating...' : 'Create Skill'}
          onPress={async () => {
            if (!name.trim() || saving) return;
            setSaving(true);
            try {
              const skill = await addSkill({ name, stage: 'saved', active });
              router.replace(`/skills/${skill.id}`);
            } finally {
              setSaving(false);
            }
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
});

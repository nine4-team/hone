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
  const [description, setDescription] = useState('');
  const [hitCondition, setHitCondition] = useState('');
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

        <FormLabel>Description</FormLabel>
        <FormInput
          multiline
          onChangeText={setDescription}
          placeholder="What are you trying to get better at?"
          style={styles.textArea}
          value={description}
        />

        <FormLabel>Hit Condition</FormLabel>
        <FormInput
          multiline
          onChangeText={setHitCondition}
          placeholder="What counts as a hit?"
          style={styles.textArea}
          value={hitCondition}
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
              const skill = await addSkill({ active, description, hitCondition, name, stage: 'saved' });
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
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { DurationSheet } from '../../components/DurationSheet';
import { FormInput, FormLabel, FormPanel, FormStack } from '../../components/FormControls';
import {
  PartnerPickerSheet,
  SOLO_PARTNER_KEY,
  type PartnerChoice,
} from '../../components/PartnerPickerSheet';
import { RadioCardGroup, type RadioCardOption } from '../../components/RadioCardGroup';
import { Screen } from '../../components/Screen';
import { Stepper } from '../../components/Stepper';
import {
  trainingLogTypeDescriptions,
  trainingLogTypeLabels,
  trainingLogTypes,
} from '../../lib/format';
import { useHitList } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';
import { textStyles } from '../../lib/typography';
import type { TrainingLogType } from '../../lib/types';

type HitRow = {
  id: string;
  partnerKey?: string;
  partnerName?: string;
  count: number;
};

const typeOptions: RadioCardOption<TrainingLogType>[] = trainingLogTypes.map((type) => ({
  value: type,
  label: trainingLogTypeLabels[type],
  description: trainingLogTypeDescriptions[type],
}));

export default function TrainingLogScreen() {
  const { skillId } = useLocalSearchParams<{ skillId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addTrainingLog, partners, skills } = useHitList();
  const skill = skills.find((item) => item.id === skillId);

  const rowId = useRef(1);
  const nextRowId = () => `row-${rowId.current++}`;

  const [type, setType] = useState<TrainingLogType>('rolling');
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [noteBody, setNoteBody] = useState('');
  const [rows, setRows] = useState<HitRow[]>([{ id: 'row-0', count: 1 }]);
  const [pickerRowId, setPickerRowId] = useState<string | null>(null);
  const [durationOpen, setDurationOpen] = useState(false);

  const totalHits = rows.reduce((sum, row) => sum + row.count, 0);

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!skill) {
    return <Screen title="Skill not found" subtitle="This skill is not in the local data set." onBack={dismiss} />;
  }

  const updateRow = (id: string, patch: Partial<HitRow>) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const removeRow = (id: string) => setRows((current) => current.filter((row) => row.id !== id));

  const handleSelect = (choice: PartnerChoice) => {
    if (pickerRowId) {
      updateRow(pickerRowId, { partnerKey: choice.key, partnerName: choice.name });
    }
    setPickerRowId(null);
  };

  const disabledKeys = rows
    .filter((row) => row.id !== pickerRowId && row.partnerKey)
    .map((row) => row.partnerKey as string);

  const save = () => {
    addTrainingLog({
      skillId: skill.id,
      type,
      durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      noteBody,
      hits: rows.map((row) => ({
        partnerName: row.partnerKey === SOLO_PARTNER_KEY ? undefined : row.partnerName,
        count: row.count,
      })),
    });
    dismiss();
  };

  const partnerLabel = (row: HitRow) => {
    if (!row.partnerKey) return 'Select partner';
    if (row.partnerKey === SOLO_PARTNER_KEY) return 'No partner';
    return row.partnerName ?? 'Partner';
  };

  return (
    <Screen
      title="Log Training"
      subtitle={skill.name}
      onBack={dismiss}
      bottomOverlay={
        <View style={[styles.saveBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <Button label="Save Log" onPress={save} />
        </View>
      }
    >
      <FormStack>
        <FormPanel>
          <FormLabel>Type</FormLabel>
          <RadioCardGroup options={typeOptions} value={type} onChange={setType} />
        </FormPanel>

        <FormPanel>
          <View style={styles.labelRow}>
            <FormLabel>Duration</FormLabel>
            <Text style={styles.optionalTag}>(optional)</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDurationOpen(true)}
            style={({ pressed }) => [styles.durationField, pressed && styles.pressed]}
          >
            <Text
              style={[styles.pickerLabel, durationMinutes === 0 && styles.pickerPlaceholder]}
            >
              {durationMinutes > 0 ? `${durationMinutes} min` : 'Not set'}
            </Text>
            <MaterialIcons name="expand-more" size={20} color={colors.muted} />
          </Pressable>
        </FormPanel>

        <FormPanel>
          <View style={styles.panelHeader}>
            <FormLabel>Hits</FormLabel>
            <Text style={styles.total}>{totalHits} total</Text>
          </View>

          <View style={styles.rows}>
            {rows.map((row) => {
              const selected = Boolean(row.partnerKey);
              return (
                <View key={row.id} style={styles.row}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setPickerRowId(row.id)}
                    style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
                  >
                    <Text
                      style={[styles.pickerLabel, !selected && styles.pickerPlaceholder]}
                      numberOfLines={1}
                    >
                      {partnerLabel(row)}
                    </Text>
                    <MaterialIcons name="expand-more" size={20} color={colors.muted} />
                  </Pressable>
                  <Stepper min={1} onChange={(count) => updateRow(row.id, { count })} value={row.count} />
                  <Pressable
                    accessibilityLabel="Remove hit"
                    accessibilityRole="button"
                    disabled={rows.length === 1}
                    hitSlop={6}
                    onPress={() => removeRow(row.id)}
                    style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
                  >
                    <MaterialIcons
                      name="close"
                      size={18}
                      color={rows.length === 1 ? colors.line : colors.quiet}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setRows((current) => [...current, { id: nextRowId(), count: 1 }])}
            style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
          >
            <MaterialIcons name="add" size={18} color={colors.sage} />
            <Text style={styles.addLabel}>Add hit row</Text>
          </Pressable>
        </FormPanel>

        <FormPanel>
          <FormLabel>Note</FormLabel>
          <FormInput
            multiline
            onChangeText={setNoteBody}
            placeholder="Add a note"
            style={styles.textarea}
            value={noteBody}
          />
        </FormPanel>

      </FormStack>

      <PartnerPickerSheet
        disabledKeys={disabledKeys}
        onClose={() => setPickerRowId(null)}
        onSelect={handleSelect}
        partners={partners}
        visible={pickerRowId !== null}
      />

      <DurationSheet
        onChange={setDurationMinutes}
        onClose={() => setDurationOpen(false)}
        value={durationMinutes}
        visible={durationOpen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addLabel: {
    ...textStyles.buttonLabel,
    color: colors.sage,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  labelRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  optionalTag: {
    color: colors.quiet,
    fontSize: 13,
    fontWeight: '500',
  },
  durationField: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 46,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  pickerLabel: {
    ...textStyles.formInput,
    flex: 1,
    fontWeight: '600',
  },
  pickerPlaceholder: {
    color: colors.quiet,
    fontWeight: '400',
  },
  pressed: {
    opacity: 0.6,
  },
  remove: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 24,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rows: {
    gap: spacing.sm,
  },
  saveBar: {
    backgroundColor: colors.bg,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  total: {
    ...textStyles.rowSummaryValue,
  },
});

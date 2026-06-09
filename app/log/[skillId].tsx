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
import { radius, spacing, useTheme } from '../../lib/theme';
import { textStyles } from '../../lib/typography';
import type { Hit, Partner, TrainingLogType } from '../../lib/types';

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
  const { logId, skillId } = useLocalSearchParams<{ logId?: string; skillId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { addTrainingLog, hits, notes, partners, skills, trainingLogs, updateTrainingLog } = useHitList();
  const skill = skills.find((item) => item.id === skillId);
  const editingLog = logId ? trainingLogs.find((log) => log.id === logId) : undefined;
  const editingHits = editingLog ? hits.filter((hit) => hit.trainingLogId === editingLog.id) : [];
  const editingNotes = editingLog ? notes.filter((note) => note.trainingLogId === editingLog.id) : [];
  const initialRows = editingLog ? hitRowsToFormRows(editingHits, partners) : [{ id: 'row-0', count: 1 }];
  const editingNoteBody = editingNotes.map((note) => note.body).join('\n\n');

  const rowId = useRef(initialRows.length);
  const nextRowId = () => `row-${rowId.current++}`;

  const [type, setType] = useState<TrainingLogType>(editingLog?.type ?? 'rolling');
  const [durationMinutes, setDurationMinutes] = useState(editingLog?.durationMinutes ?? 0);
  const [noteBody, setNoteBody] = useState(editingNoteBody);
  const [rows, setRows] = useState<HitRow[]>(initialRows);
  const [pickerRowId, setPickerRowId] = useState<string | null>(null);
  const [durationOpen, setDurationOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalHits = rows.reduce((sum, row) => sum + row.count, 0);

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!skill) {
    return <Screen title="Skill not found" subtitle="This skill is not in the local data set." onBack={dismiss} />;
  }

  if (logId && !editingLog) {
    return <Screen title="Training log not found" subtitle="This log is not in the local data set." onBack={dismiss} />;
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

  const save = async () => {
    if (saving) return;

    const input = {
      type,
      durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      noteBody,
      hits: rows.map((row) => ({
        partnerName: row.partnerKey === SOLO_PARTNER_KEY ? undefined : row.partnerName,
        count: row.count,
      })),
    };

    setSaving(true);
    try {
      if (editingLog) {
        await updateTrainingLog({ id: editingLog.id, ...input });
      } else {
        await addTrainingLog({ skillId: skill.id, ...input });
      }

      dismiss();
    } finally {
      setSaving(false);
    }
  };

  const partnerLabel = (row: HitRow) => {
    if (!row.partnerKey) return 'Select partner';
    if (row.partnerKey === SOLO_PARTNER_KEY) return 'No partner';
    return row.partnerName ?? 'Partner';
  };

  return (
    <Screen
      title={editingLog ? 'Edit Training' : 'Log Training'}
      subtitle={skill.name}
      onBack={dismiss}
      bottomOverlay={
        <View
          style={[
            styles.saveBar,
            {
              backgroundColor: colors.bg,
              borderTopColor: colors.line,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          <Button
            label={saving ? 'Saving...' : editingLog ? 'Save Changes' : 'Save Log'}
            onPress={save}
          />
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
            <Text style={[styles.optionalTag, { color: colors.quiet }]}>(optional)</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDurationOpen(true)}
            style={({ pressed }) => [
              styles.durationField,
              { backgroundColor: colors.surface, borderColor: colors.line },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.pickerLabel,
                { color: durationMinutes === 0 ? colors.quiet : colors.ink },
                durationMinutes === 0 && styles.pickerPlaceholder,
              ]}
            >
              {durationMinutes > 0 ? `${durationMinutes} min` : 'Not set'}
            </Text>
            <MaterialIcons name="expand-more" size={20} color={colors.muted} />
          </Pressable>
        </FormPanel>

        <FormPanel>
          <View style={styles.panelHeader}>
            <FormLabel>Hits</FormLabel>
            <Text style={[styles.total, { color: colors.ink }]}>{totalHits} total</Text>
          </View>

          <View style={styles.rows}>
            {rows.map((row) => {
              const selected = Boolean(row.partnerKey);
              return (
                <View key={row.id} style={styles.row}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setPickerRowId(row.id)}
                    style={({ pressed }) => [
                      styles.picker,
                      { backgroundColor: colors.surface, borderColor: colors.line },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerLabel,
                        { color: selected ? colors.ink : colors.quiet },
                        !selected && styles.pickerPlaceholder,
                      ]}
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
            <Text style={[styles.addLabel, { color: colors.sage }]}>Add hit row</Text>
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

function hitRowsToFormRows(hits: Hit[], partners: Partner[]): HitRow[] {
  return hits.map((hit, index) => {
    const partner = hit.partnerId ? partners.find((item) => item.id === hit.partnerId) : undefined;

    return {
      id: `row-${index}`,
      partnerKey: partner?.id ?? SOLO_PARTNER_KEY,
      partnerName: partner?.name,
      count: hit.count,
    };
  });
}

const styles = StyleSheet.create({
  addLabel: {
    ...textStyles.buttonLabel,
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
    fontSize: 13,
    fontWeight: '500',
  },
  durationField: {
    alignItems: 'center',
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

import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import type React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  PartnerPickerSheet,
  SOLO_PARTNER_KEY,
  type PartnerChoice,
} from './PartnerPickerSheet';
import { Stepper } from './Stepper';
import { inferMediaType } from '../lib/mediaMetadata';
import { radius, spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { Partner } from '../lib/types';

type HitEntrySheetProps = {
  visible: boolean;
  partners: Partner[];
  onClose: () => void;
  onSave: (input: { partnerName?: string; count: number }) => void;
};

type MediaEntrySheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (input: { url: string; notes?: string }) => Promise<void> | void;
};

type NoteEntrySheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (body: string) => void;
};

export function HitEntrySheet({ visible, partners, onClose, onSave }: HitEntrySheetProps) {
  const colors = useTheme();
  const [partnerChoice, setPartnerChoice] = useState<PartnerChoice | null>(null);
  const [count, setCount] = useState(1);
  const [partnerPickerOpen, setPartnerPickerOpen] = useState(false);

  const reset = () => {
    setPartnerChoice(null);
    setCount(1);
    setPartnerPickerOpen(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const save = () => {
    onSave({
      partnerName: partnerChoice?.key === SOLO_PARTNER_KEY ? undefined : partnerChoice?.name,
      count,
    });
    close();
  };

  const partnerLabel = !partnerChoice
    ? 'Select partner'
    : partnerChoice.key === SOLO_PARTNER_KEY
      ? 'No partner'
      : partnerChoice.name ?? 'Partner';

  return (
    <>
      <Sheet visible={visible} title="Log Hit" onClose={close}>
        <View style={styles.fieldStack}>
          <Text style={[styles.fieldLabel, { color: colors.ink }]}>Partner</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPartnerPickerOpen(true)}
            style={({ pressed }) => [
              styles.picker,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.line },
              pressed && styles.pressed,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.pickerLabel, { color: partnerChoice ? colors.ink : colors.quiet }]}
            >
              {partnerLabel}
            </Text>
            <MaterialIcons name="expand-more" size={20} color={colors.muted} />
          </Pressable>
        </View>
        <View style={styles.fieldStack}>
          <Text style={[styles.fieldLabel, { color: colors.ink }]}>Hits</Text>
          <View style={styles.stepperRow}>
            <Stepper min={1} onChange={setCount} value={count} />
          </View>
        </View>
        <SheetActions
          canSave={count > 0}
          onCancel={close}
          onSave={save}
          saveLabel="Save Hit"
        />
      </Sheet>
      <PartnerPickerSheet
        onClose={() => setPartnerPickerOpen(false)}
        onSelect={(choice) => {
          setPartnerChoice(choice);
          setPartnerPickerOpen(false);
        }}
        partners={partners}
        visible={partnerPickerOpen}
      />
    </>
  );
}

export function MediaEntrySheet({ visible, onClose, onSave }: MediaEntrySheetProps) {
  const colors = useTheme();
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setUrl('');
    setNotes('');
    setSaving(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const save = async () => {
    if (!url.trim() || saving) return;
    setSaving(true);
    await onSave({ url, notes });
    close();
  };

  return (
    <Sheet visible={visible} title="Add Media" onClose={close}>
      <TextInput
        autoCapitalize="none"
        keyboardType="url"
        onChangeText={setUrl}
        placeholder="URL"
        placeholderTextColor={colors.quiet}
        style={[styles.input, { backgroundColor: colors.surfaceMuted, color: colors.ink }]}
        value={url}
      />
      <TextInput
        multiline
        onChangeText={setNotes}
        placeholder="Note"
        placeholderTextColor={colors.quiet}
        style={[
          styles.input,
          styles.textarea,
          { backgroundColor: colors.surfaceMuted, color: colors.ink },
        ]}
        value={notes}
      />
      {url.trim() ? (
        <View style={[styles.mediaHint, { borderColor: colors.line }]}>
          <MaterialIcons
            name={inferMediaType(url) === 'instagram' ? 'photo-camera' : inferMediaType(url) === 'youtube' ? 'play-circle-outline' : 'link'}
            size={20}
            color={colors.sage}
          />
          <Text style={[styles.mediaHintText, { color: colors.muted }]} numberOfLines={1}>
            {getHostLabel(url)}
          </Text>
        </View>
      ) : null}
      <SheetActions
        canSave={Boolean(url.trim()) && !saving}
        onCancel={close}
        onSave={save}
        saveLabel={saving ? 'Saving...' : 'Save Media'}
      />
    </Sheet>
  );
}

export function NoteEntrySheet({ visible, onClose, onSave }: NoteEntrySheetProps) {
  const colors = useTheme();
  const [body, setBody] = useState('');

  const close = () => {
    setBody('');
    onClose();
  };

  const save = () => {
    if (!body.trim()) return;
    onSave(body);
    close();
  };

  return (
    <Sheet visible={visible} title="Add Note" onClose={close}>
      <TextInput
        autoFocus
        multiline
        onChangeText={setBody}
        placeholder="Add a note"
        placeholderTextColor={colors.quiet}
        style={[
          styles.input,
          styles.noteInput,
          { backgroundColor: colors.surfaceMuted, color: colors.ink },
        ]}
        value={body}
      />
      <SheetActions
        canSave={Boolean(body.trim())}
        onCancel={close}
        onSave={save}
        saveLabel="Save Note"
      />
    </Sheet>
  );
}

function Sheet({
  children,
  onClose,
  title,
  visible,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
}) {
  const colors = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          <View style={styles.content}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetActions({
  canSave,
  onCancel,
  onSave,
  saveLabel,
}: {
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  const colors = useTheme();

  return (
    <View style={[styles.actions, { borderTopColor: colors.line }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      >
        <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        disabled={!canSave}
        onPress={onSave}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      >
        <Text style={[styles.saveText, { color: canSave ? colors.sage : colors.quiet }]}>
          {saveLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function getHostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const styles = StyleSheet.create({
  actionButton: {
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  actions: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: -spacing.xl,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  cancelText: {
    ...textStyles.composerAction,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  fieldLabel: {
    ...textStyles.formLabel,
  },
  fieldStack: {
    gap: spacing.xs,
  },
  input: {
    ...textStyles.formInput,
    borderRadius: radius.md,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediaHint: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  mediaHintText: {
    ...textStyles.formHelp,
    flex: 1,
  },
  noteInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  picker: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  pickerLabel: {
    ...textStyles.formInput,
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
  saveText: {
    ...textStyles.composerActionPrimary,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  stepperRow: {
    alignItems: 'flex-start',
  },
  textarea: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  title: {
    ...textStyles.menuTitle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});

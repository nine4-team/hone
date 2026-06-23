import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import type React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  PartnerPickerContent,
  SOLO_PARTNER_KEY,
  type PartnerChoice,
} from './PartnerPickerSheet';
import { Stepper } from './Stepper';
import { inferMediaType } from '../lib/mediaMetadata';
import { radius, spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { Partner, Skill } from '../lib/types';

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

type QuickAddMode = 'hit' | 'media' | 'note';
type HitEntryStep = 'form' | 'partner';
type GlobalHitStep = 'menu' | 'skill' | 'hit';

type QuickAddEntrySheetProps = {
  visible: boolean;
  initialMode?: QuickAddMode | null;
  title?: string;
  partners: Partner[];
  onClose: () => void;
  onTrainingLog: () => void;
  onSaveHit: (input: { partnerName?: string; count: number }) => void;
  onSaveMedia: (input: { url: string; notes?: string }) => Promise<void> | void;
  onSaveNote: (body: string) => void;
};

type GlobalHitEntrySheetProps = {
  visible: boolean;
  partners: Partner[];
  skills: Skill[];
  onClose: () => void;
  onOpenCreateSkill: () => void;
  onSaveHit: (input: { skillId: string; partnerName?: string; count: number }) => Promise<void>;
};

export function HitEntrySheet({ visible, partners, onClose, onSave }: HitEntrySheetProps) {
  return (
    <Sheet visible={visible} title="Log Hit" onClose={onClose}>
      <HitEntryForm
        key={visible ? 'hit-open' : 'hit-closed'}
        partners={partners}
        onCancel={onClose}
        onSave={(input) => {
          onSave(input);
          onClose();
        }}
      />
    </Sheet>
  );
}

export function MediaEntrySheet({ visible, onClose, onSave }: MediaEntrySheetProps) {
  return (
    <Sheet visible={visible} title="Add Media" onClose={onClose}>
      <MediaEntryForm
        key={visible ? 'media-open' : 'media-closed'}
        onCancel={onClose}
        onSave={async (input) => {
          await onSave(input);
          onClose();
        }}
      />
    </Sheet>
  );
}

export function NoteEntrySheet({ visible, onClose, onSave }: NoteEntrySheetProps) {
  return (
    <Sheet visible={visible} title="Add Note" onClose={onClose}>
      <NoteEntryForm
        key={visible ? 'note-open' : 'note-closed'}
        onCancel={onClose}
        onSave={(body) => {
          onSave(body);
          onClose();
        }}
      />
    </Sheet>
  );
}

export function QuickAddEntrySheet({
  visible,
  initialMode = null,
  title = 'Quick Add',
  partners,
  onClose,
  onTrainingLog,
  onSaveHit,
  onSaveMedia,
  onSaveNote,
}: QuickAddEntrySheetProps) {
  const colors = useTheme();
  const [mode, setMode] = useState<QuickAddMode | null>(initialMode);

  useEffect(() => {
    if (visible) {
      setMode(initialMode);
    } else {
      setMode(null);
    }
  }, [initialMode, visible]);

  const close = () => {
    setMode(null);
    onClose();
  };

  const saveAndClose = <T,>(save: (input: T) => Promise<void> | void) => async (input: T) => {
    await save(input);
    close();
  };

  const sheetTitle = mode === 'hit' ? 'Log Hit' : mode === 'media' ? 'Add Media' : mode === 'note' ? 'Add Note' : title;

  return (
    <Sheet visible={visible} title={sheetTitle} onClose={close}>
      {mode === null ? (
        <View style={styles.menuList}>
          <QuickAddRow
            icon="gps-fixed"
            label="Hit"
            colors={colors}
            onPress={() => setMode('hit')}
          />
          <QuickAddRow
            icon="assignment"
            label="Training Log"
            colors={colors}
            onPress={() => {
              close();
              onTrainingLog();
            }}
          />
          <QuickAddRow
            icon="perm-media"
            label="Media"
            colors={colors}
            onPress={() => setMode('media')}
          />
          <QuickAddRow
            icon="edit-note"
            label="Note"
            colors={colors}
            onPress={() => setMode('note')}
          />
        </View>
      ) : mode === 'hit' ? (
        <HitEntryForm partners={partners} onCancel={close} onSave={saveAndClose(onSaveHit)} />
      ) : mode === 'media' ? (
        <MediaEntryForm onCancel={close} onSave={saveAndClose(onSaveMedia)} />
      ) : (
        <NoteEntryForm onCancel={close} onSave={saveAndClose(onSaveNote)} />
      )}
    </Sheet>
  );
}

export function GlobalHitEntrySheet({
  visible,
  partners,
  skills,
  onClose,
  onOpenCreateSkill,
  onSaveHit,
}: GlobalHitEntrySheetProps) {
  const colors = useTheme();
  const [step, setStep] = useState<GlobalHitStep>('menu');
  const [query, setQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setStep('menu');
      setQuery('');
      setSelectedSkill(null);
      setSaving(false);
      setErrorMessage(null);
    }
  }, [visible]);

  const normalizedQuery = query.trim().toLowerCase();
  const matchingSkills = skills
    .filter((skill) => !normalizedQuery || skill.name.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
  const activeSkills = matchingSkills.filter((skill) => skill.active);
  const arsenalSkills = matchingSkills.filter((skill) => !skill.active);

  const close = () => {
    if (!saving) onClose();
  };

  const saveExistingSkillHit = async (input: { partnerName?: string; count: number }) => {
    if (!selectedSkill || saving) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSaveHit({ skillId: selectedSkill.id, ...input });
      onClose();
    } catch {
      setErrorMessage('Could not log hit. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet visible={visible} title={step === 'menu' ? 'Add' : 'Log Hit'} onClose={close}>
      {step === 'menu' ? (
        <View style={styles.menuList}>
          <QuickAddRow
            colors={colors}
            icon="add"
            label="Create Skill"
            onPress={() => {
              onClose();
              onOpenCreateSkill();
            }}
          />
          <QuickAddRow
            colors={colors}
            disabled={skills.length === 0}
            helperText={skills.length === 0 ? 'Create a skill to log hits' : undefined}
            icon="gps-fixed"
            label="Log Hit"
            onPress={() => setStep('skill')}
          />
        </View>
      ) : step === 'skill' ? (
        <>
          <TextInput
            autoCapitalize="none"
            autoFocus
            clearButtonMode="while-editing"
            onChangeText={setQuery}
            placeholder="Search skills"
            placeholderTextColor={colors.quiet}
            style={[styles.input, { backgroundColor: colors.surfaceMuted, color: colors.ink }]}
            value={query}
          />
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.skillPickerList}>
            <SkillChoiceSection
              label="Hit List"
              skills={activeSkills}
              onSelect={(skill) => {
                setSelectedSkill(skill);
                setStep('hit');
              }}
            />
            <SkillChoiceSection
              label="Arsenal"
              skills={arsenalSkills}
              onSelect={(skill) => {
                setSelectedSkill(skill);
                setStep('hit');
              }}
            />
            {matchingSkills.length === 0 ? (
              <Text style={[styles.emptySkillText, { color: colors.muted }]}>No matching skills.</Text>
            ) : null}
          </ScrollView>
        </>
      ) : (
        <>
          {errorMessage ? <Text style={[styles.sheetError, { color: colors.clay }]}>{errorMessage}</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => setStep('skill')}
            style={({ pressed }) => [styles.selectedSkillRow, pressed && styles.pressed]}
          >
            <View style={styles.selectedSkillText}>
              <Text style={[styles.selectedSkillLabel, { color: colors.muted }]}>Skill</Text>
              <Text style={[styles.selectedSkillName, { color: colors.ink }]} numberOfLines={1}>
                {selectedSkill?.name}
              </Text>
            </View>
            <MaterialIcons name="swap-horiz" size={20} color={colors.sage} />
          </Pressable>
          <HitEntryForm
            canSave={!saving}
            partners={partners}
            onCancel={() => setStep('skill')}
            onSave={saveExistingSkillHit}
            saveLabel={saving ? 'Saving...' : 'Save Hit'}
          />
        </>
      )}
    </Sheet>
  );
}

function HitEntryForm({
  canSave = true,
  partners,
  onCancel,
  onSave,
  saveLabel = 'Save Hit',
}: {
  canSave?: boolean;
  partners: Partner[];
  onCancel: () => void;
  onSave: (input: { partnerName?: string; count: number }) => Promise<void> | void;
  saveLabel?: string;
}) {
  const colors = useTheme();
  const [partnerChoice, setPartnerChoice] = useState<PartnerChoice | null>(null);
  const [count, setCount] = useState(1);
  const [step, setStep] = useState<HitEntryStep>('form');

  const save = async () => {
    await onSave({
      partnerName: partnerChoice?.key === SOLO_PARTNER_KEY ? undefined : partnerChoice?.name,
      count,
    });
  };

  const partnerLabel = !partnerChoice
    ? 'Select partner'
    : partnerChoice.key === SOLO_PARTNER_KEY
      ? 'No partner'
      : partnerChoice.name ?? 'Partner';

  if (step === 'partner') {
    return (
      <PartnerPickerContent
        partners={partners}
        onSelect={(choice) => {
          setPartnerChoice(choice);
          setStep('form');
        }}
      />
    );
  }

  return (
    <>
      <View style={styles.fieldStack}>
        <Text style={[styles.fieldLabel, { color: colors.ink }]}>Partner</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setStep('partner')}
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
        canSave={canSave && count > 0}
        onCancel={onCancel}
        onSave={save}
        saveLabel={saveLabel}
      />
    </>
  );
}

function SkillChoiceSection({
  label,
  onSelect,
  skills,
}: {
  label: string;
  onSelect: (skill: Skill) => void;
  skills: Skill[];
}) {
  const colors = useTheme();

  if (skills.length === 0) return null;

  return (
    <View style={styles.skillSection}>
      <Text style={[styles.skillSectionLabel, { color: colors.muted }]}>{label}</Text>
      {skills.map((skill) => (
        <Pressable
          key={skill.id}
          accessibilityRole="button"
          onPress={() => onSelect(skill)}
          style={({ pressed }) => [
            styles.skillChoice,
            { borderTopColor: colors.line },
            pressed && { backgroundColor: colors.surfaceMuted },
          ]}
        >
          <Text style={[styles.skillChoiceText, { color: colors.ink }]} numberOfLines={1}>
            {skill.name}
          </Text>
          <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

function MediaEntryForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (input: { url: string; notes?: string }) => Promise<void> | void;
}) {
  const colors = useTheme();
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!url.trim() || saving) return;
    setSaving(true);
    await onSave({ url, notes });
  };

  return (
    <>
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
        onCancel={onCancel}
        onSave={save}
        saveLabel={saving ? 'Saving...' : 'Save Media'}
      />
    </>
  );
}

function NoteEntryForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (body: string) => void;
}) {
  const colors = useTheme();
  const [body, setBody] = useState('');

  const save = () => {
    if (!body.trim()) return;
    onSave(body);
  };

  return (
    <>
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
        onCancel={onCancel}
        onSave={save}
        saveLabel="Save Note"
      />
    </>
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
          <View style={[styles.header, { borderBottomColor: colors.strongLine }]}>
            <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          </View>
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
  onSave: () => Promise<void> | void;
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

function QuickAddRow({
  colors,
  disabled = false,
  helperText,
  icon,
  label,
  onPress,
}: {
  colors: ReturnType<typeof useTheme>;
  disabled?: boolean;
  helperText?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { borderTopColor: colors.line },
        pressed && !disabled && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={styles.menuItemLabelRow}>
        <MaterialIcons name={icon} size={21} color={disabled ? colors.quiet : colors.sage} />
        <View style={styles.menuItemTextBlock}>
          <Text style={[styles.menuItemText, { color: disabled ? colors.quiet : colors.ink }]}>
            {label}
          </Text>
          {helperText ? (
            <Text style={[styles.menuItemHelp, { color: colors.muted }]}>{helperText}</Text>
          ) : null}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={disabled ? colors.line : colors.muted} />
    </Pressable>
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
    paddingTop: spacing.md,
  },
  fieldLabel: {
    ...textStyles.formLabel,
  },
  fieldStack: {
    gap: spacing.xs,
  },
  emptySkillText: {
    ...textStyles.formHelp,
    paddingVertical: spacing.md,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
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
  menuItem: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xl,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  menuItemLabelRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  menuItemText: {
    ...textStyles.menuItem,
    flex: 1,
  },
  menuItemHelp: {
    ...textStyles.formHelp,
  },
  menuItemTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  menuList: {
    marginTop: -spacing.md,
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
  selectedSkillLabel: {
    ...textStyles.formHelp,
  },
  selectedSkillName: {
    ...textStyles.formInput,
  },
  selectedSkillRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  selectedSkillText: {
    flex: 1,
    minWidth: 0,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  sheetError: {
    ...textStyles.formHelp,
  },
  skillChoice: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  skillChoiceText: {
    ...textStyles.menuItem,
    flex: 1,
  },
  skillPickerList: {
    maxHeight: 300,
  },
  skillSection: {
    gap: 0,
  },
  skillSectionLabel: {
    ...textStyles.formHelp,
    paddingTop: spacing.sm,
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
  },
});

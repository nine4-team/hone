import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, type ThemeColors, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';
import type { Partner } from '../lib/types';

export const SOLO_PARTNER_KEY = '__solo__';
export const CUSTOM_PARTNER_PREFIX = 'custom:';

export type PartnerChoice = {
  key: string;
  name?: string;
};

type PartnerPickerSheetProps = {
  visible: boolean;
  partners: Partner[];
  disabledKeys?: string[];
  onSelect: (choice: PartnerChoice) => void;
  onClose: () => void;
};

export function PartnerPickerSheet({
  visible,
  partners,
  disabledKeys = [],
  onSelect,
  onClose,
}: PartnerPickerSheetProps) {
  const colors = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.strongLine }]}>
            <Text style={[styles.title, { color: colors.ink }]}>Select or create partner</Text>
          </View>
          <PartnerPickerContent
            disabledKeys={disabledKeys}
            onSelect={onSelect}
            partners={partners}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function PartnerPickerContent({
  disabledKeys = [],
  partners,
  onSelect,
}: {
  disabledKeys?: string[];
  partners: Partner[];
  onSelect: (choice: PartnerChoice) => void;
}) {
  const colors = useTheme();
  const inputRef = useRef<TextInput | null>(null);
  const createInputRef = useRef<TextInput | null>(null);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const disabled = useMemo(() => new Set(disabledKeys), [disabledKeys]);
  const q = query.trim().toLowerCase();
  const newName = partnerName.trim();

  const matches = useMemo(
    () => partners.filter((partner) => !q || partner.name.toLowerCase().includes(q)),
    [partners, q],
  );

  const choose = (choice: PartnerChoice) => {
    setQuery('');
    setPartnerName('');
    setCreating(false);
    onSelect(choice);
  };

  const startCreating = () => {
    setCreating(true);
    requestAnimationFrame(() => createInputRef.current?.focus());
  };

  const cancelCreating = () => {
    setPartnerName('');
    setCreating(false);
  };

  const createPartner = () => {
    if (!newName) return;
    choose({ key: `${CUSTOM_PARTNER_PREFIX}${newName.toLowerCase()}`, name: newName });
  };

  if (creating) {
    return (
      <View style={styles.content}>
        <View style={styles.createFields}>
          <View style={[styles.searchWrap, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialIcons name="person-add-alt-1" size={18} color={colors.quiet} />
            <TextInput
              autoCapitalize="words"
              autoFocus
              onChangeText={setPartnerName}
              onSubmitEditing={createPartner}
              placeholder="Partner name"
              placeholderTextColor={colors.quiet}
              ref={createInputRef}
              returnKeyType="done"
              style={[styles.search, { color: colors.ink }]}
              value={partnerName}
            />
          </View>
          <View style={styles.createActions}>
            <Pressable
              accessibilityRole="button"
              onPress={cancelCreating}
              style={({ pressed }) => [
                styles.createButton,
                { borderColor: colors.line },
                pressed && { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <MaterialIcons name="close" size={18} color={colors.muted} />
              <Text style={[styles.createButtonText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !newName }}
              disabled={!newName}
              onPress={createPartner}
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.sage, borderColor: colors.sage },
                !newName && { opacity: 0.45 },
                pressed && newName && styles.pressed,
              ]}
            >
              <MaterialIcons name="check" size={18} color={colors.surface} />
              <Text style={[styles.createButtonText, { color: colors.surface }]}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceMuted }]}>
        <MaterialIcons name="search" size={18} color={colors.quiet} />
        <TextInput
          autoCapitalize="words"
          autoFocus
          ref={inputRef}
          onChangeText={setQuery}
          placeholder="Search partners"
          placeholderTextColor={colors.quiet}
          style={[styles.search, { color: colors.ink }]}
          value={query}
        />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
        <PickerRow
          label="No partner"
          colors={colors}
          disabled={disabled.has(SOLO_PARTNER_KEY)}
          onPress={() => choose({ key: SOLO_PARTNER_KEY })}
        />
        {q.length === 0 ? (
          <PickerRow
            icon="add-circle-outline"
            label="Create new partner"
            colors={colors}
            onPress={startCreating}
          />
        ) : null}
        {matches.map((partner) => (
          <PickerRow
            key={partner.id}
            label={partner.name}
            colors={colors}
            disabled={disabled.has(partner.id)}
            onPress={() => choose({ key: partner.id, name: partner.name })}
          />
        ))}
        {matches.length === 0 && q.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted }]}>
            No partners yet - create one to add hits.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PickerRow({
  label,
  onPress,
  colors,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { borderTopColor: colors.line },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      {icon ? <MaterialIcons name={icon} size={20} color={colors.sage} /> : null}
      <Text
        style={[styles.itemText, { color: disabled ? colors.quiet : colors.ink }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {disabled ? <Text style={[styles.added, { color: colors.quiet }]}>Added</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  added: {
    ...textStyles.formHelp,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingTop: spacing.md,
  },
  createActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
  },
  createButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 44,
    justifyContent: 'center',
  },
  createButtonText: {
    ...textStyles.buttonLabel,
  },
  createFields: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  empty: {
    ...textStyles.formHelp,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  item: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  itemText: {
    ...textStyles.menuItem,
    flex: 1,
  },
  list: {
    maxHeight: 320,
  },
  pressed: {
    opacity: 0.78,
  },
  search: {
    ...textStyles.formInput,
    flex: 1,
    paddingVertical: 0,
  },
  searchWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  title: {
    ...textStyles.menuTitle,
  },
});

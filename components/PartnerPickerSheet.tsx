import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';
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
  const [query, setQuery] = useState('');
  const disabled = useMemo(() => new Set(disabledKeys), [disabledKeys]);
  const q = query.trim().toLowerCase();

  const matches = useMemo(
    () => partners.filter((partner) => !q || partner.name.toLowerCase().includes(q)),
    [partners, q],
  );
  const exact = partners.some((partner) => partner.name.toLowerCase() === q);

  const choose = (choice: PartnerChoice) => {
    setQuery('');
    onSelect(choice);
  };

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Select partner</Text>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={18} color={colors.quiet} />
            <TextInput
              autoCapitalize="words"
              autoFocus
              onChangeText={setQuery}
              placeholder="Search partners"
              placeholderTextColor={colors.quiet}
              style={styles.search}
              value={query}
            />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
            <PickerRow
              label="No partner"
              disabled={disabled.has(SOLO_PARTNER_KEY)}
              onPress={() => choose({ key: SOLO_PARTNER_KEY })}
            />
            {matches.map((partner) => (
              <PickerRow
                key={partner.id}
                label={partner.name}
                disabled={disabled.has(partner.id)}
                onPress={() => choose({ key: partner.id, name: partner.name })}
              />
            ))}
            {q.length > 0 && !exact ? (
              <PickerRow
                icon="add-circle-outline"
                label={`Create “${query.trim()}”`}
                onPress={() =>
                  choose({ key: `${CUSTOM_PARTNER_PREFIX}${q}`, name: query.trim() })
                }
              />
            ) : null}
            {matches.length === 0 && q.length === 0 ? (
              <Text style={styles.empty}>No partners yet — type a name to add one.</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PickerRow({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      {icon ? <MaterialIcons name={icon} size={20} color={colors.sage} /> : null}
      <Text style={[styles.itemText, disabled && styles.itemTextDisabled]} numberOfLines={1}>
        {label}
      </Text>
      {disabled ? <Text style={styles.added}>Added</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  added: {
    ...textStyles.formHelp,
    color: colors.quiet,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  empty: {
    ...textStyles.formHelp,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  item: {
    alignItems: 'center',
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  itemText: {
    ...textStyles.menuItem,
    flex: 1,
  },
  itemTextDisabled: {
    color: colors.quiet,
  },
  list: {
    maxHeight: 320,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  search: {
    ...textStyles.formInput,
    flex: 1,
    paddingVertical: 0,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  title: {
    ...textStyles.menuTitle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});

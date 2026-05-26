import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

export type BottomSheetMenuItem = {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type BottomSheetMenuProps = {
  visible: boolean;
  title?: string;
  items: BottomSheetMenuItem[];
  onRequestClose: () => void;
};

export function BottomSheetMenu({ visible, title, items, onRequestClose }: BottomSheetMenuProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onRequestClose}>
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <Pressable style={styles.sheet}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {items.map((item, index) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => {
                onRequestClose();
                setTimeout(item.onPress, 100);
              }}
              style={({ pressed }) => [
                styles.item,
                index > 0 && styles.itemBorder,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.itemText, item.destructive && styles.destructiveText]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  destructiveText: {
    color: colors.clay,
  },
  item: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  itemBorder: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemText: {
    ...textStyles.menuItem,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingBottom: spacing.lg,
  },
  title: {
    ...textStyles.menuTitle,
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

export type BottomSheetMenuItem = {
  key: string;
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  closeBehavior?: 'before-action' | 'after-action' | 'none';
  destructive?: boolean;
  selected?: boolean;
};

type BottomSheetMenuProps = {
  visible: boolean;
  title?: string;
  items: BottomSheetMenuItem[];
  onRequestClose: () => void;
};

export function BottomSheetMenu({ visible, title, items, onRequestClose }: BottomSheetMenuProps) {
  const colors = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onRequestClose}>
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {title ? (
            <Text style={[styles.title, { borderBottomColor: colors.strongLine, color: colors.ink }]}>
              {title}
            </Text>
          ) : null}
          {items.map((item, index) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => {
                if (item.closeBehavior === 'after-action') {
                  item.onPress();
                  onRequestClose();
                  return;
                }

                if (item.closeBehavior === 'none') {
                  item.onPress();
                  return;
                }

                onRequestClose();
                item.onPress();
              }}
              style={({ pressed }) => [
                styles.item,
                index > 0 && { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
                pressed && { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <View style={styles.itemLabelRow}>
                {item.icon ? (
                  <MaterialIcons
                    name={item.icon}
                    size={21}
                    color={item.destructive ? colors.clay : colors.sage}
                  />
                ) : null}
                <Text style={[styles.itemText, { color: item.destructive ? colors.clay : colors.ink }]}>
                  {item.label}
                </Text>
              </View>
              {item.selected ? <MaterialIcons name="check" size={20} color={colors.sage} /> : null}
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
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  itemLabelRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  itemText: {
    ...textStyles.menuItem,
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingBottom: spacing.lg,
  },
  title: {
    ...textStyles.menuTitle,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});

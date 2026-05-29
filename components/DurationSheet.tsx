import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { DurationWheel } from './DurationWheel';
import { spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

type DurationSheetProps = {
  visible: boolean;
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
};

export function DurationSheet({ visible, value, onChange, onClose }: DurationSheetProps) {
  const colors = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Close duration picker"
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.strongLine }]}>
            <Text style={[styles.title, { color: colors.ink }]}>Duration</Text>
          </View>
          <DurationWheel onChange={onChange} value={value} />
          <View style={styles.footer}>
            <Button label="Done" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: spacing.xl,
  },
  title: {
    ...textStyles.menuTitle,
    textAlign: 'center',
  },
});

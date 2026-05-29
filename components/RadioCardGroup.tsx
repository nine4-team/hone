import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

export type RadioCardOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type RadioCardGroupProps<T extends string> = {
  options: RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function RadioCardGroup<T extends string>({ options, value, onChange }: RadioCardGroupProps<T>) {
  const colors = useTheme();

  return (
    <View style={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: selected ? colors.surface : colors.surfaceMuted,
                borderColor: selected ? colors.sage : colors.line,
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.text}>
              <Text style={[styles.label, { color: selected ? colors.ink : colors.muted }]}>
                {option.label}
              </Text>
              {option.description ? (
                <Text style={[styles.description, { color: colors.muted }]}>{option.description}</Text>
              ) : null}
            </View>
            <MaterialIcons
              name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selected ? colors.sage : colors.quiet}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  description: {
    ...textStyles.formHelp,
    marginTop: 2,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    ...textStyles.formLabel,
  },
  pressed: {
    opacity: 0.74,
  },
  text: {
    flex: 1,
  },
});

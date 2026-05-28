import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

type InfoTooltipProps = {
  accessibilityLabel?: string;
  body: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function InfoTooltip({
  accessibilityLabel,
  body,
  size = 18,
  style,
  title,
}: InfoTooltipProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? `About ${title}`}
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => Alert.alert(title, body)}
      style={({ pressed }) => [
        styles.infoButton,
        { height: size, width: size },
        style,
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons name="info-outline" size={size} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.68,
  },
});

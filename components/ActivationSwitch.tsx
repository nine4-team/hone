import { Switch } from 'react-native';
import { useTheme } from '../lib/theme';

type ActivationSwitchProps = {
  onValueChange: (value: boolean) => void;
  value: boolean;
};

export function ActivationSwitch({ onValueChange, value }: ActivationSwitchProps) {
  const colors = useTheme();

  return (
    <Switch
      accessibilityLabel={value ? 'Deactivate skill' : 'Activate skill'}
      ios_backgroundColor={colors.line}
      onValueChange={onValueChange}
      thumbColor={colors.surface}
      trackColor={{ false: colors.line, true: colors.sage }}
      value={value}
    />
  );
}

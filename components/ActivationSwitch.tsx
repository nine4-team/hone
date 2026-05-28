import { Switch } from 'react-native';
import { colors } from '../lib/theme';

type ActivationSwitchProps = {
  onValueChange: (value: boolean) => void;
  value: boolean;
};

export function ActivationSwitch({ onValueChange, value }: ActivationSwitchProps) {
  return (
    <Switch
      accessibilityLabel={value ? 'Unequip skill' : 'Equip skill'}
      ios_backgroundColor={colors.line}
      onValueChange={onValueChange}
      thumbColor={colors.surface}
      trackColor={{ false: colors.line, true: colors.sage }}
      value={value}
    />
  );
}

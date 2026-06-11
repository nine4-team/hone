import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { spacing } from '../lib/theme';
import { InfoTooltip } from './InfoTooltip';

type InfoLabelProps = {
  body?: string;
  infoSize?: number;
  label: string;
  labelStyle: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function InfoLabel({ body, infoSize = 18, label, labelStyle, numberOfLines = 1 }: InfoLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, labelStyle]} numberOfLines={numberOfLines}>
        {label}
      </Text>
      {body ? <InfoTooltip title={label} body={body} size={infoSize} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  label: {
    flexShrink: 1,
  },
});

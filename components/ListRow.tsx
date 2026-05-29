import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';
import { Card } from './ui';

type ListRowIcon =
  | keyof typeof MaterialIcons.glyphMap
  | ComponentType<SvgProps & { color?: string; size?: number | string }>;

type ListRowProps = {
  chevron?: boolean;
  href?: Href;
  icon?: ListRowIcon;
  meta?: string;
  onPress?: () => void;
  title: string;
};

export function ListRow({
  chevron,
  href,
  icon,
  meta,
  onPress,
  title,
}: ListRowProps) {
  const router = useRouter();
  const colors = useTheme();
  const shouldShowChevron = chevron ?? Boolean(href);
  const row = (
    <Pressable
      accessibilityRole={href ? 'link' : 'button'}
      onPress={onPress ?? (href ? () => router.push(href) : undefined)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.titleRow}>
        {icon ? <RowIcon color={colors.ink} icon={icon} /> : null}
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.ink }]} numberOfLines={1}>{title}</Text>
          {meta ? <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>{meta}</Text> : null}
        </View>
      </View>
      {shouldShowChevron ? <MaterialIcons name="chevron-right" size={24} color={colors.muted} /> : null}
    </Pressable>
  );

  return <Card>{row}</Card>;
}

function RowIcon({ color, icon }: { color: string; icon: ListRowIcon }) {
  if (typeof icon === 'string') {
    return <MaterialIcons name={icon} size={22} color={color} style={styles.icon} />;
  }

  const Icon = icon;
  return (
    <View style={styles.icon}>
      <Icon color={color} size={22} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: spacing.md,
  },
  meta: {
    ...textStyles.listRowMeta,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...textStyles.listRowTitle,
  },
  titleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
});

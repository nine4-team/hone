import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';
import { Card } from './ui';

type ListRowProps = {
  href?: Href;
  icon?: keyof typeof MaterialIcons.glyphMap;
  meta?: string;
  onPress?: () => void;
  title: string;
};

export function ListRow({ href, icon, meta, onPress, title }: ListRowProps) {
  const router = useRouter();
  const row = (
    <Pressable
      accessibilityRole={href ? 'link' : 'button'}
      onPress={onPress ?? (href ? () => router.push(href) : undefined)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.titleRow}>
        {icon ? <MaterialIcons name={icon} size={22} color={colors.ink} style={styles.icon} /> : null}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : null}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
    </Pressable>
  );

  return <Card>{row}</Card>;
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

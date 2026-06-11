import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme';

type SvgNavigationIcon = ComponentType<SvgProps & { color?: string; size?: number | string }>;

export type FloatingNavigationItem = {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap | SvgNavigationIcon;
  label: string;
  selected?: boolean;
  onPress: () => void;
};

type FloatingNavigationProps = {
  items: FloatingNavigationItem[];
  createLabel?: string;
  onCreatePress?: () => void;
  showFade?: boolean;
};

export function FloatingNavigation({
  createLabel = 'Create skill',
  items,
  onCreatePress,
  showFade = true,
}: FloatingNavigationProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useTheme();

  return (
    <View pointerEvents="box-none" style={styles.tabBarWrap}>
      {showFade ? (
        <View pointerEvents="none" style={styles.fade}>
          {[0, 0.08, 0.2, 0.4, 0.65, 0.85, 1].map((opacity, index) => (
            <View key={index} style={[styles.fadeStep, { backgroundColor: colors.bg, opacity }]} />
          ))}
        </View>
      ) : null}
      <View
        style={[
          styles.tabBarRow,
          { backgroundColor: colors.bg, paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <View style={[styles.navPill, { backgroundColor: colors.surface }]}>
          {items.map((item) => (
            <NavigationButton key={item.key} item={item} />
          ))}
        </View>
        <Pressable
          accessibilityLabel={createLabel}
          accessibilityRole="button"
          onPress={onCreatePress ?? (() => router.push('/skills/new'))}
          style={({ pressed }) => [
            styles.createButtonOuter,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.createButtonInner, { backgroundColor: colors.sage }]}>
            <MaterialIcons name="add" size={24} color={colors.surface} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function NavigationButton({ item }: { item: FloatingNavigationItem }) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="button"
      accessibilityState={item.selected ? { selected: true } : {}}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.navButton,
        item.selected && { backgroundColor: colors.sage },
        pressed && styles.pressed,
      ]}
    >
      <NavigationIcon icon={item.icon} selected={item.selected} />
    </Pressable>
  );
}

function NavigationIcon({
  icon,
  selected,
}: {
  icon: FloatingNavigationItem['icon'];
  selected?: boolean;
}) {
  const colors = useTheme();
  const color = selected ? colors.surface : colors.muted;

  if (typeof icon === 'string') {
    return <MaterialIcons name={icon} size={22} color={color} />;
  }

  const Icon = icon;
  return <Icon color={color} size={22} strokeWidth={2.25} />;
}

const styles = StyleSheet.create({
  createButtonInner: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  createButtonOuter: {
    alignItems: 'center',
    borderRadius: 26,
    elevation: 8,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    width: 52,
  },
  fade: {
    height: 32,
  },
  fadeStep: {
    flex: 1,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginHorizontal: 2,
    width: 48,
  },
  navPill: {
    alignItems: 'center',
    borderRadius: 26,
    elevation: 8,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  tabBarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  tabBarWrap: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

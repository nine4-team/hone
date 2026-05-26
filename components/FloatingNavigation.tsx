import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';

export type FloatingNavigationItem = {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  selected?: boolean;
  onPress: () => void;
};

type FloatingNavigationProps = {
  items: FloatingNavigationItem[];
  createLabel?: string;
  onCreatePress?: () => void;
};

export function FloatingNavigation({
  createLabel = 'Create skill',
  items,
  onCreatePress,
}: FloatingNavigationProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View pointerEvents="box-none" style={styles.tabBarWrap}>
      <View pointerEvents="none" style={styles.fade}>
        {[0, 0.08, 0.2, 0.4, 0.65, 0.85, 1].map((opacity, index) => (
          <View key={index} style={[styles.fadeStep, { opacity }]} />
        ))}
      </View>
      <View style={[styles.tabBarRow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.navPill}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={item.selected ? { selected: true } : {}}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.navButton,
                item.selected && styles.navButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={item.selected ? colors.surface : colors.muted}
              />
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityLabel={createLabel}
          accessibilityRole="button"
          onPress={onCreatePress ?? (() => router.push('/skills/new'))}
          style={({ pressed }) => [styles.createButtonOuter, pressed && styles.pressed]}
        >
          <View style={styles.createButtonInner}>
            <MaterialIcons name="add" size={24} color={colors.surface} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  createButtonInner: {
    alignItems: 'center',
    backgroundColor: colors.sage,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  createButtonOuter: {
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    backgroundColor: colors.bg,
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
  navButtonActive: {
    backgroundColor: colors.sage,
  },
  navPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    backgroundColor: colors.bg,
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

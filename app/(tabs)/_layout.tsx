import { Tabs, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FloatingNavigation, type FloatingNavigationItem } from '../../components/FloatingNavigation';
import { colors } from '../../lib/theme';

const visibleRoutes = ['index', 'library', 'settings'];

const routeIcons: Record<string, Pick<FloatingNavigationItem, 'icon'>> = {
  index: { icon: 'sports-kabaddi' as keyof typeof MaterialIcons.glyphMap },
  library: { icon: 'inventory-2' },
  settings: { icon: 'settings' },
};

const routeLabels: Record<string, string> = {
  index: 'Equipped skills',
  library: 'Arsenal',
  settings: 'Settings',
};

function FloatingTabBar({ state, navigation }: any) {
  const pathname = usePathname();
  const visiblePathnames = new Set(['/', '/settings', '/library', '/partners']);
  if (!visiblePathnames.has(pathname)) return null;

  const routes = state.routes.filter((route: any) => visibleRoutes.includes(route.name));
  const activeRouteKey = state.routes[state.index]?.key;

  return (
    <FloatingNavigation
      items={routes.map((route: any) => {
        const focused = route.key === activeRouteKey;

        return {
          key: route.key,
          ...(routeIcons[route.name] ?? { icon: 'circle' }),
          label: `${routeLabels[route.name]} tab`,
          selected: focused,
          onPress: () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          },
        };
      })}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Equipped Skills' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: 'Arsenal' }}
      />
      <Tabs.Screen
        name="partners"
        options={{ href: null, title: 'Partners' }}
      />
    </Tabs>
  );
}

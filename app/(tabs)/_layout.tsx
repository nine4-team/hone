import { Tabs, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ArsenalIcon } from '../../components/ArsenalIcon';
import { FloatingNavigation, type FloatingNavigationItem } from '../../components/FloatingNavigation';
import { useTheme } from '../../lib/theme';

const visibleRoutes = ['index', 'library', 'settings'];

const routeIcons: Record<string, Pick<FloatingNavigationItem, 'icon'>> = {
  index: { icon: 'sports-kabaddi' as keyof typeof MaterialIcons.glyphMap },
  library: { icon: ArsenalIcon },
  settings: { icon: 'settings' },
};

const routeLabels: Record<string, string> = {
  index: 'Active skills',
  library: 'Arsenal',
  settings: 'Settings',
};

function FloatingTabBar({ state, navigation }: any) {
  const pathname = usePathname();
  const visiblePathnames = new Set(['/', '/settings', '/library', '/partners']);
  if (!visiblePathnames.has(pathname)) return null;

  const routes = visibleRoutes
    .map((routeName) => state.routes.find((route: any) => route.name === routeName))
    .filter(Boolean);
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
  const colors = useTheme();

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
        options={{ title: 'Active Skills' }}
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

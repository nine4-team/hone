import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FloatingNavigation } from '../../components/FloatingNavigation';
import { colors } from '../../lib/theme';

const visibleRoutes = ['index', 'pipeline', 'settings'];

const routeIcons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'task-alt',
  pipeline: 'view-column',
  settings: 'settings',
};

const routeLabels: Record<string, string> = {
  index: 'Active skills',
  pipeline: 'Pipeline',
  settings: 'Settings',
};

function FloatingTabBar({ state, navigation }: any) {
  const routes = state.routes.filter((route: any) => visibleRoutes.includes(route.name));
  const activeRouteKey = state.routes[state.index]?.key;

  return (
    <FloatingNavigation
      items={routes.map((route: any) => {
        const focused = route.key === activeRouteKey;

        return {
          key: route.key,
          icon: routeIcons[route.name] ?? 'circle',
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
        options={{ title: 'Active' }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{ title: 'Pipeline' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
      <Tabs.Screen
        name="library"
        options={{ href: null, title: 'Library' }}
      />
      <Tabs.Screen
        name="partners"
        options={{ href: null, title: 'Partners' }}
      />
    </Tabs>
  );
}

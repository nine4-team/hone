import { Tabs, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ArsenalIcon } from '../../components/ArsenalIcon';
import { GlobalHitEntrySheet } from '../../components/EntrySheets';
import { FloatingNavigation, type FloatingNavigationItem } from '../../components/FloatingNavigation';
import { useHitList } from '../../lib/store';
import { useTheme } from '../../lib/theme';

const visibleRoutes = ['index', 'library', 'partners', 'settings'];

const routeIcons: Record<string, Pick<FloatingNavigationItem, 'icon'>> = {
  index: { icon: 'gps-fixed' as keyof typeof MaterialIcons.glyphMap },
  library: { icon: ArsenalIcon },
  partners: { icon: 'sports-kabaddi' },
  settings: { icon: 'settings' },
};

const routeLabels: Record<string, string> = {
  index: 'Hit List',
  library: 'Arsenal',
  partners: 'Partners',
  settings: 'Settings',
};

function FloatingTabBar({ state, navigation }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    addStandaloneHit,
    loading,
    partners,
    skillPackOnboardingCompleted,
    skills,
  } = useHitList();
  const [hitSheetOpen, setHitSheetOpen] = useState(false);
  const visiblePathnames = new Set(['/', '/settings', '/library', '/partners']);
  if (!visiblePathnames.has(pathname)) return null;

  const showingSkillPackOnboarding =
    pathname === '/' && !loading && skills.length === 0 && !skillPackOnboardingCompleted;

  const routes = visibleRoutes
    .map((routeName) => state.routes.find((route: any) => route.name === routeName))
    .filter(Boolean);
  const activeRouteKey = state.routes[state.index]?.key;

  return (
    <>
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
        createLabel="Add"
        onCreatePress={() => setHitSheetOpen(true)}
        showFade={!showingSkillPackOnboarding}
      />
      <GlobalHitEntrySheet
        visible={hitSheetOpen}
        partners={partners}
        skills={skills}
        onClose={() => setHitSheetOpen(false)}
        onOpenCreateSkill={() => router.push('/skills/new')}
        onSaveHit={addStandaloneHit}
      />
    </>
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
        options={{ title: 'Hit List' }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: 'Arsenal' }}
      />
      <Tabs.Screen
        name="partners"
        options={{ title: 'Partners' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}

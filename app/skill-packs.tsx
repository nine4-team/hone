import { useRouter } from 'expo-router';
import { SkillPackPicker } from '../components/SkillPackPicker';
import { Screen } from '../components/Screen';
import { useHitList } from '../lib/store';
import { useToast } from '../lib/useToast';

export default function SkillPacksScreen() {
  const router = useRouter();
  const { importPacks, skillPackImports } = useHitList();
  const { showToast, toastMessage } = useToast();

  return (
    <Screen
      title="Skill Packs"
      titleIcon="inventory"
      subtitle="Load curated skills as active Hit List targets or save them to your Arsenal."
      toastMessage={toastMessage}
      onBack={() => router.back()}
      scroll={false}
    >
      <SkillPackPicker
        importedPackSlugs={skillPackImports.map((item) => item.packSlug)}
        onImport={async (selections) => {
          try {
            await importPacks(selections);
            showToast('Skill pack added');
          } catch {
            showToast('Could not add skill pack');
          }
        }}
      />
    </Screen>
  );
}

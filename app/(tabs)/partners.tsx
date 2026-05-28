import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { formatHitCount } from '../../lib/format';
import { useHone } from '../../lib/store';
import { spacing } from '../../lib/theme';

export default function PartnersScreen() {
  const { hits, partners } = useHone();

  return (
    <Screen title="Partners" titleIcon="group" subtitle="See what you have hit on each person.">
      <View style={styles.list}>
        {partners.length === 0 ? (
          <EmptyState
            title="No partners yet"
            body="Partners are created when you attribute hits during training logs."
          />
        ) : (
          partners.map((partner) => {
            const totalHits = hits
              .filter((hit) => hit.partnerId === partner.id)
              .reduce((sum, hit) => sum + hit.count, 0);

            return (
              <ListRow
                key={partner.id}
                href={`/partners/${partner.id}`}
                meta={formatHitCount(totalHits)}
                title={partner.name}
              />
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});

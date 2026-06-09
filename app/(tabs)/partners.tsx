import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/ui';
import { formatHitCount } from '../../lib/format';
import { useHitList } from '../../lib/store';
import { spacing, useTheme } from '../../lib/theme';
import { textStyles } from '../../lib/typography';

export default function PartnersScreen() {
  const { error, hits, loading, partners, reload } = useHitList();
  const colors = useTheme();
  const router = useRouter();

  const rows = partners
    .map((partner) => {
      const totalHits = hits
        .filter((hit) => hit.partnerId === partner.id)
        .reduce((sum, hit) => sum + hit.count, 0);

      return {
        partner,
        totalHits,
      };
    })
    .filter((row) => row.totalHits > 0)
    .sort((a, b) => b.totalHits - a.totalHits || a.partner.name.localeCompare(b.partner.name));

  if (loading || error) {
    return (
      <Screen
        title="Partners"
        titleIcon="sports-kabaddi"
        subtitle="Who you've landed each skill on."
      >
        <View style={styles.list}>
          <EmptyState
            title={loading ? 'Loading partners' : 'Could not load partners'}
            body={error ?? 'Syncing partner-attributed hits.'}
          />
          {error ? <Button label="Retry" onPress={reload} variant="secondary" /> : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Partners"
      titleIcon="sports-kabaddi"
      subtitle="Who you've landed each skill on."
    >
      <View style={styles.list}>
        {rows.length === 0 ? (
          <EmptyState
            title="No partners yet"
            body="People appear here when you attribute hits while logging training."
          />
        ) : (
          rows.map(({ partner, totalHits }) => (
            <Card key={partner.id} style={styles.card}>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push(`/partners/${partner.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.titleRow}>
                  <MaterialIcons name="person-search" size={22} color={colors.ink} style={styles.rowIcon} />
                  <View style={styles.textBlock}>
                    <Text style={[styles.rowTitle, { color: colors.ink }]} numberOfLines={1}>{partner.name}</Text>
                    <Text style={[styles.rowMeta, { color: colors.muted }]} numberOfLines={1}>
                      {formatHitCount(totalHits)}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
              </Pressable>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  list: {
    gap: spacing.md,
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
  rowIcon: {
    marginRight: spacing.md,
  },
  rowMeta: {
    ...textStyles.listRowMeta,
    marginTop: 2,
  },
  rowTitle: {
    ...textStyles.listRowTitle,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
});

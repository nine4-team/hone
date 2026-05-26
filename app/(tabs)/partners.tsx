import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useHone } from '../../lib/store';
import { colors, radius, spacing } from '../../lib/theme';

export default function PartnersScreen() {
  const { hits, partners } = useHone();

  return (
    <Screen title="Partners" subtitle="See what you have hit on each person.">
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
              <Link key={partner.id} href={`/partners/${partner.id}`} asChild>
                <Pressable style={({ pressed }) => [styles.partner, pressed && styles.pressed]}>
                  <Text style={styles.name}>{partner.name}</Text>
                  <Text style={styles.meta}>{totalHits} hits logged</Text>
                </Pressable>
              </Link>
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
  partner: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.78,
  },
  name: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});

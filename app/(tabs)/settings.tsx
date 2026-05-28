import { StyleSheet, View } from 'react-native';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { spacing } from '../../lib/theme';

export default function SettingsScreen() {
  return (
    <Screen title="Settings" titleIcon="settings">
      <View style={styles.list}>
        <ListRow href="/library" icon="search" title="Library" />
        <ListRow href="/partners" icon="group" title="Partners" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});

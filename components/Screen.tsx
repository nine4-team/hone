import { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
  bottomOverlay?: ReactNode;
  status?: ReactNode;
  stickyHeader?: ReactNode;
  onBack?: () => void;
}>;

export function Screen({ title, subtitle, action, bottomOverlay, children, onBack, status, stickyHeader }: ScreenProps) {
  const [titleWidth, setTitleWidth] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {onBack ? (
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="chevron-left" size={26} color={colors.sage} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.titleRow}>
          <View style={styles.titleCenter}>
            <Text
              onLayout={(event) => setTitleWidth(event.nativeEvent.layout.width)}
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {title}
            </Text>
            {status ? <View style={styles.statusLine}>{status}</View> : null}
          </View>
          {subtitle ? (
            <Pressable
              accessibilityLabel={`About ${title}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => Alert.alert(title, subtitle)}
              style={({ pressed }) => [
                styles.infoButton,
                styles.infoOverlay,
                { transform: [{ translateX: titleWidth / 2 + 6 }] },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons name="info-outline" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <View style={[styles.headerSide, styles.headerRight]}>{action}</View>
      </View>
      {stickyHeader ? <View style={styles.stickyHeader}>{stickyHeader}</View> : null}
      <ScrollView contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
      {bottomOverlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 116,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.lg,
  },
  headerSide: {
    justifyContent: 'center',
    minWidth: 72,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...textStyles.screenTitle,
    textAlign: 'center',
  },
  titleRow: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  titleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  statusLine: {
    alignItems: 'center',
  },
  stickyHeader: {
    backgroundColor: colors.bg,
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 32,
  },
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 32,
  },
  infoOverlay: {
    left: '50%',
    position: 'absolute',
    top: -1,
  },
  pressed: {
    opacity: 0.68,
  },
});

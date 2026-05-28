import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoLabel } from './InfoLabel';
import { colors, spacing } from '../lib/theme';
import { textStyles } from '../lib/typography';

type ScreenProps = PropsWithChildren<{
  title: string;
  titleIcon?: keyof typeof MaterialIcons.glyphMap;
  subtitle?: string;
  action?: ReactNode;
  bottomOverlay?: ReactNode;
  status?: ReactNode;
  stickyHeader?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  toastMessage?: string | null;
  onBack?: () => void;
}>;

export function Screen({
  title,
  subtitle,
  action,
  bottomOverlay,
  children,
  onBack,
  contentStyle,
  scroll = true,
  status,
  stickyHeader,
  toastMessage,
  titleIcon,
}: ScreenProps) {
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
            <View style={styles.titleGroup}>
              {titleIcon ? (
                <MaterialIcons name={titleIcon} size={20} color={colors.ink} />
              ) : null}
              <InfoLabel label={title} body={subtitle} labelStyle={styles.headerTitle} />
            </View>
            {status ? <View style={styles.statusLine}>{status}</View> : null}
          </View>
        </View>
        <View style={[styles.headerSide, styles.headerRight]}>{action}</View>
      </View>
      {stickyHeader ? <View style={styles.stickyHeader}>{stickyHeader}</View> : null}
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.staticContent, contentStyle]}>{children}</View>
      )}
      {bottomOverlay}
      {toastMessage ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    position: 'relative',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 116,
    paddingTop: spacing.md,
  },
  staticContent: {
    flex: 1,
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
  titleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toastText: {
    ...textStyles.toast,
  },
  toastWrap: {
    alignItems: 'center',
    bottom: 116,
    elevation: 20,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
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
  pressed: {
    opacity: 0.68,
  },
});

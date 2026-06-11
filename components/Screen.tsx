import type { ComponentType, PropsWithChildren, ReactNode, RefObject } from 'react';
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
import type { SvgProps } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoLabel } from './InfoLabel';
import { spacing, useTheme } from '../lib/theme';
import { textStyles } from '../lib/typography';

type ScreenTitleIcon =
  | keyof typeof MaterialIcons.glyphMap
  | ComponentType<SvgProps & { color?: string; size?: number | string }>;

type ScreenProps = PropsWithChildren<{
  title: string;
  titleIcon?: ScreenTitleIcon;
  subtitle?: string;
  action?: ReactNode;
  bottomOverlay?: ReactNode;
  status?: ReactNode;
  stickyHeader?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollRef?: RefObject<ScrollView | null>;
  scroll?: boolean;
  toastMessage?: string | null;
  onBack?: () => void;
  titleNumberOfLines?: number;
}>;

export function Screen({
  title,
  subtitle,
  action,
  bottomOverlay,
  children,
  onBack,
  contentStyle,
  scrollRef,
  scroll = true,
  status,
  stickyHeader,
  toastMessage,
  titleIcon,
  titleNumberOfLines = 1,
}: ScreenProps) {
  const colors = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.header,
          titleNumberOfLines > 1 && styles.headerMultilineTitle,
          { backgroundColor: colors.bg, borderBottomColor: colors.line },
        ]}
      >
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
              {titleIcon ? <TitleIcon color={colors.ink} icon={titleIcon} /> : null}
              <InfoLabel
                label={title}
                body={subtitle}
                labelStyle={[styles.headerTitle, { color: colors.ink }]}
                numberOfLines={titleNumberOfLines}
              />
            </View>
            {status ? <View style={styles.statusLine}>{status}</View> : null}
          </View>
        </View>
        <View style={[styles.headerSide, styles.headerRight]}>{action}</View>
      </View>
      {stickyHeader ? (
        <View style={[styles.stickyHeader, { backgroundColor: colors.bg, borderBottomColor: colors.line }]}>
          {stickyHeader}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.staticContent, contentStyle]}>{children}</View>
      )}
      {bottomOverlay}
      {toastMessage ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={[styles.toast, { backgroundColor: colors.ink }]}>
            <Text style={[styles.toastText, { color: colors.surface }]}>{toastMessage}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function TitleIcon({ color, icon }: { color: string; icon: ScreenTitleIcon }) {
  if (typeof icon === 'string') {
    return <MaterialIcons name={icon} size={20} color={color} />;
  }

  const Icon = icon;
  return <Icon color={color} size={20} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    position: 'relative',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 116,
    paddingTop: spacing.md,
  },
  staticContent: {
    flex: 1,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.lg,
  },
  headerMultilineTitle: {
    minHeight: 74,
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

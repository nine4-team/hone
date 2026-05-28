import type { TextStyle } from 'react-native';
import { colors } from './theme';

type NamedTextStyle = Pick<
  TextStyle,
  'color' | 'fontSize' | 'fontWeight' | 'lineHeight'
>;

export const textStyles = {
  buttonLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  buttonLabelCompact: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  composerAction: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  composerActionPrimary: {
    color: colors.sage,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  formInput: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  formHelp: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  formLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  headerStatus: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  headerStatusValue: {
    color: colors.sage,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  menuItem: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  menuTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  rowValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowValueSubtle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  rowSummaryLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowSummaryValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  listRowTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  listRowMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  pipelineColumnTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  sectionTitleCount: {
    color: colors.sage,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  toast: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  skillCardName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  skillCardFocusLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  skillCardFocusValue: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  },
  skillCardMetaLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  skillCardMetaValue: {
    color: colors.quiet,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  detailRecordBody: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  },
  detailRecordMeta: {
    color: colors.quiet,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  detailRecordTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  stageLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  stageLabelActive: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
} satisfies Record<string, NamedTextStyle>;

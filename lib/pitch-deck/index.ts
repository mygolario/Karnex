export { SlideThemes, resolveTheme, PRIMARY_THEME_KEYS, DEFAULT_THEME_KEY } from "./themes";
export type { PitchTheme, PitchThemeKey } from "./themes";
export { SLIDE_TYPE_LABELS, SLIDE_TYPE_OPTIONS, getSlideTypeLabel } from "./labels";
export {
  convertPersianArabicDigits,
  safeString,
  parseNum,
  getVisibleSlides,
  createEmptySlide,
  createBlankDeck,
} from "./utils";
export { buildCompletenessChecklist } from "./completeness";
export type { CompletenessItem } from "./completeness";
export {
  buildSyncProposals,
  applySyncProposals,
  getProjectContextSummary,
} from "./sync";
export type { SyncProposal } from "./sync";
export { exportPitchDeckPptx } from "./export-pptx";

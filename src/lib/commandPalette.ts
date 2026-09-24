// A window event decouples the search trigger (header, mobile menu, toolbox)
// from the palette component mounted once in the root layout.

export const OPEN_SEARCH_EVENT = 'hie:open-search';

export interface OpenSearchDetail {
  /** Optional text to prefill, e.g. "RF " from the toolbox search field. */
  query?: string;
}

export function openCommandPalette(detail: OpenSearchDetail = {}) {
  window.dispatchEvent(new CustomEvent<OpenSearchDetail>(OPEN_SEARCH_EVENT, { detail }));
}

/** Platform-appropriate shortcut label. */
export function shortcutLabel(): string {
  if (typeof navigator === 'undefined') return '⌘K';
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
}

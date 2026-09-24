/** Lower-case, accent-folded text with dashes unified and whitespace collapsed. */
export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalized letters-and-digits words: "IEEE TCAS-II, 2024" gives ieee, tcas, ii, 2024. */
export function words(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

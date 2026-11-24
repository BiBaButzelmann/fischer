export const TITLES = [
  "GM",
  "IM",
  "FM",
  "CM",
  "WGM",
  "WIM",
  "WFM",
  "WCM",
] as const;

export type Title = (typeof TITLES)[number];

export function isTitle(value: string | null | undefined): value is Title {
  return TITLES.some((title) => title === value);
}

export function formatPlayerName(firstName: string, lastName: string) {
  return `${removeAccentsEnhanced(lastName.trim())},${removeAccentsEnhanced(firstName.trim())}`;
}

function removeAccentsEnhanced(str: string): string {
  const result = removeAccents(str);
  return result.replace(
    /[æÆœŒðÐøØßþÞĳĲйЙёЁ]/g,
    (match) => specialCases[match as keyof typeof specialCases] || match,
  );
}

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const specialCases = {
  æ: "ae",
  Æ: "AE",
  œ: "oe",
  Œ: "OE",
  ð: "d",
  Ð: "D",
  ø: "o",
  Ø: "O",
  ß: "ss",
  þ: "th",
  Þ: "Th",
  ĳ: "ij",
  Ĳ: "IJ",
  й: "и",
  Й: "И",
  ё: "е",
  Ё: "Е",
};

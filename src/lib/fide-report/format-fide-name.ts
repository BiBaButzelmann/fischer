export function formatPlayerName(firstName: string, lastName: string) {
  return `${removeAccentsEnhanced(lastName.trim())},${removeAccentsEnhanced(firstName.trim())}`;
}

export function formatRefereeName(firstName: string, lastName: string) {
  return `${removeAccentsEnhanced(firstName.trim())} ${removeAccentsEnhanced(lastName.trim())}`;
}

function removeAccentsEnhanced(str: string): string {
  const pre = str.replace(
    /[äÄöÖüÜ]/g,
    (m) => umlautMap[m as keyof typeof umlautMap],
  );
  const result = removeAccents(pre);
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

const umlautMap = {
  ä: "ae",
  Ä: "Ae",
  ö: "oe",
  Ö: "Oe",
  ü: "ue",
  Ü: "Ue",
};

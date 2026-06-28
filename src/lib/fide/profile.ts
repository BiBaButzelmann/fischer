const FIDE_TITLE_MAP: Record<string, string> = {
  grandmaster: "GM",
  "international master": "IM",
  "fide master": "FM",
  "candidate master": "CM",
  "woman grandmaster": "WGM",
  "woman international master": "WIM",
  "woman fide master": "WFM",
  "woman candidate master": "WCM",
};

export type FideProfile = {
  name: string | null;
  fideId: string;
  fideRating: number | null;
  birthYear: number | null;
  gender: "m" | "f" | null;
  title: string | null;
};

export async function getFideProfile(
  fideId: string,
): Promise<FideProfile | null> {
  const id = fideId.trim();
  if (!/^\d+$/.test(id)) {
    return null;
  }

  let html: string;
  try {
    const response = await fetch(`https://ratings.fide.com/profile/${id}`);
    if (!response.ok) {
      return null;
    }
    html = await response.text();
  } catch {
    return null;
  }

  const std = matchRating(html, "standart");

  const birthYearRaw = matchInfo(html, "byear");
  const birthYear =
    birthYearRaw && /^\d{4}$/.test(birthYearRaw) ? Number(birthYearRaw) : null;

  const sex = matchInfo(html, "sex");
  const gender = sex === "Male" ? "m" : sex === "Female" ? "f" : null;

  const titleRaw = matchInfo(html, "title");
  const title =
    titleRaw && titleRaw !== "None"
      ? (FIDE_TITLE_MAP[titleRaw.toLowerCase()] ?? null)
      : null;

  const name =
    html.match(/<title>([^<]+?)\s*FIDE Profile<\/title>/i)?.[1]?.trim() ?? null;

  return { name, fideId: id, fideRating: std, birthYear, gender, title };
}

function matchRating(html: string, cls: string): number | null {
  const m = html.match(
    new RegExp(`profile-${cls}\\b[\\s\\S]*?<p>\\s*(\\d{1,4})\\s*</p>`, "i"),
  );
  const value = m ? Number(m[1]) : NaN;
  return Number.isFinite(value) && value >= 1000 ? value : null;
}

function matchInfo(html: string, cls: string): string | null {
  const m = html.match(
    new RegExp(
      `profile-info-${cls}\\b[^>]*>\\s*(?:<p>)?\\s*([^<\\n]+?)\\s*</`,
      "i",
    ),
  );
  return m ? m[1].trim() : null;
}

import { unstable_cache } from "next/cache";

const DOCUMENTS_BASE_URL = "https://klubturnier.hsk1830.de/pdfs";

async function documentExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

export const getTournamentDocumentAvailability = unstable_cache(
  async (slug: string): Promise<{ ausschreibung: boolean; turnierordnung: boolean }> => {
    const [ausschreibung, turnierordnung] = await Promise.all([
      documentExists(`${DOCUMENTS_BASE_URL}/${slug}/ausschreibung.pdf`),
      documentExists(`${DOCUMENTS_BASE_URL}/${slug}/turnierordnung.pdf`),
    ]);
    return { ausschreibung, turnierordnung };
  },
  ["tournament-document-availability"],
  { revalidate: 3600 },
);

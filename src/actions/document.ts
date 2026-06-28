"use server";

const DOCUMENTS_BASE_URL = "https://klubturnier.hsk1830.de/pdfs";

async function documentExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      next: { revalidate: 3600 },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getTournamentDocumentAvailability(slug: string): Promise<{
  ausschreibung: boolean;
  turnierordnung: boolean;
}> {
  const [ausschreibung, turnierordnung] = await Promise.all([
    documentExists(`${DOCUMENTS_BASE_URL}/${slug}/ausschreibung.pdf`),
    documentExists(`${DOCUMENTS_BASE_URL}/${slug}/turnierordnung.pdf`),
  ]);
  return { ausschreibung, turnierordnung };
}

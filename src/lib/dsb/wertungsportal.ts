import { unstable_cache } from "next/cache";
import { transliterateGermanUmlauts } from "./candidate";
import { DSB_BASE_URL } from "./constants";
import type { DsbPerson } from "./types";

const DSB_FETCH_TIMEOUT_MS = 5000;
const DSB_CACHE_TTL_SECONDS = 60 * 60 * 24;

type DsbPersonsResponse = {
  data: DsbPerson[];
};

const fetchDsbPersonsByName = unstable_cache(
  async (firstName: string, lastName: string): Promise<DsbPerson[]> => {
    const params = new URLSearchParams({
      lastname: transliterateGermanUmlauts(lastName),
    });
    if (firstName.length > 0) {
      params.set("firstname", transliterateGermanUmlauts(firstName));
    }
    const response = await fetch(
      `${DSB_BASE_URL}/persons?${params.toString()}`,
      { signal: AbortSignal.timeout(DSB_FETCH_TIMEOUT_MS) },
    );
    if (!response.ok) {
      throw new Error(`DSB persons request failed: ${response.status}`);
    }
    const body = (await response.json()) as DsbPersonsResponse;
    return body.data ?? [];
  },
  ["dsb-persons-search"],
  { revalidate: DSB_CACHE_TTL_SECONDS },
);

const fetchDsbPersonById = unstable_cache(
  async (nuLigaPersonId: string): Promise<DsbPerson | null> => {
    const response = await fetch(
      `${DSB_BASE_URL}/persons/${encodeURIComponent(nuLigaPersonId)}`,
      { signal: AbortSignal.timeout(DSB_FETCH_TIMEOUT_MS) },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`DSB person request failed: ${response.status}`);
    }
    return (await response.json()) as DsbPerson;
  },
  ["dsb-person-by-id"],
  { revalidate: DSB_CACHE_TTL_SECONDS },
);

export async function searchDsbPersons(
  firstName: string,
  lastName: string,
): Promise<DsbPerson[]> {
  const trimmedLastName = lastName.trim();
  if (trimmedLastName.length === 0) {
    return [];
  }
  try {
    return await fetchDsbPersonsByName(firstName.trim(), trimmedLastName);
  } catch {
    return [];
  }
}

export async function getDsbPersonById(
  nuLigaPersonId: string,
): Promise<DsbPerson | null> {
  const id = nuLigaPersonId.trim();
  if (id.length === 0) {
    return null;
  }
  try {
    return await fetchDsbPersonById(id);
  } catch {
    return null;
  }
}

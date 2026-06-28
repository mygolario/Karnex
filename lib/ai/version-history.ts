/** Client-side version history for AI outputs (max 3 per feature key) */

export interface StoredAIVersion<T = unknown> {
  id: string;
  label: string;
  createdAt: string;
  data: T;
  summary?: string;
}

const MAX_VERSIONS = 3;

export function pushAIVersion<T>(
  existing: StoredAIVersion<T>[] | undefined,
  data: T,
  summary?: string
): StoredAIVersion<T>[] {
  const entry: StoredAIVersion<T> = {
    id: crypto.randomUUID(),
    label: `نسخه ${(existing?.length ?? 0) + 1}`,
    createdAt: new Date().toISOString(),
    data,
    summary,
  };
  return [entry, ...(existing ?? [])].slice(0, MAX_VERSIONS);
}

export function getAIVersionById<T>(
  versions: StoredAIVersion<T>[] | undefined,
  id: string
): StoredAIVersion<T> | undefined {
  return versions?.find((v) => v.id === id);
}

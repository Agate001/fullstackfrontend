export const API_BASE =
  "https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/";

function lowerFirst(value: string) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function normalizeApiValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeApiValue);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        lowerFirst(key),
        normalizeApiValue(entry),
      ]),
    );
  }

  return value;
}

export async function readJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;

  try {
    return normalizeApiValue(JSON.parse(text)) as T;
  } catch {
    return null;
  }
}

export async function readError(res: Response, fallback = "Request failed") {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;

  try {
    const data = normalizeApiValue(JSON.parse(text)) as { message?: string; title?: string };
    return data.message || data.title || fallback;
  } catch {
    return text || fallback;
  }
}

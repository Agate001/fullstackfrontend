export const API_BASE =
  "https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/";

export async function readJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

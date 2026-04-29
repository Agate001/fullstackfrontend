import { API_BASE, readJson } from "@/lib/api";
import { CreateTimeRecordDto, TimeRecord } from "@/interfaces/interface";

const url = `${API_BASE}TimeRecord/`;

export async function getAllTimeRecords(): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAll`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordById(id: number): Promise<TimeRecord | null> {
  const res = await fetch(`${url}GetOneById/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return await readJson<TimeRecord>(res);
}

export async function getTimeRecordsByUserId(userId: number): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByUserId/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordsByTag(tag: string): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByTag/${encodeURIComponent(tag)}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordsByIsProductive(
  isProductive: boolean
): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByIsProductive/${isProductive}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function createTimeRecord(
  dto: CreateTimeRecordDto
): Promise<TimeRecord | null> {
  const res = await fetch(`${url}Create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const body = await readJson<{ message?: string }>(res);
    throw new Error(body?.message ?? "Failed to create time record");
  }

  return await readJson<TimeRecord>(res);
}
export async function deleteTimeRecord(id: number): Promise<boolean> {
  const res = await fetch(`${url}Delete/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
}
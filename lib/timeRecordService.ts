import { CreateTimeRecordDto, TimeRecord } from "@/interfaces/interface";
import { API_BASE, readError, readJson } from "@/lib/api";
import { authHeaders } from "@/lib/userservice";

const url = `${API_BASE}TimeRecord/`;

type RqtTimeRecordBody = {
  UserId: number;
  Started: string;
  Stopped: string;
  Length: string;
  Goal: string;
  Category: string;
  Tags: string[];
  IsProductive: boolean;
};

const toRqtTimeRecord = (dto: CreateTimeRecordDto): RqtTimeRecordBody => ({
  UserId: dto.userId,
  Started: dto.started,
  Stopped: dto.stopped,
  Length: dto.length ?? "00:00:00",
  Goal: dto.goal,
  Category: dto.category,
  Tags: dto.tags,
  IsProductive: dto.isProductive,
});

export async function getAllTimeRecords(): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAll`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get time records"));
    return [];
  }

  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordById(
  id: number,
): Promise<TimeRecord | null> {
  const res = await fetch(`${url}GetOneById/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get time record"));
    return null;
  }

  return await readJson<TimeRecord>(res);
}

export async function getTimeRecordsByUserId(
  userId: number,
): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByUserId/${userId}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get user time records"));
    return [];
  }

  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordsByCategory(
  category: string,
): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByCategory/${encodeURIComponent(category)}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get category time records"));
    return [];
  }

  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordsByTag(tag: string): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByTag/${encodeURIComponent(tag)}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get tag time records"));
    return [];
  }

  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function getTimeRecordsByIsProductive(
  isProductive: boolean,
): Promise<TimeRecord[]> {
  const res = await fetch(`${url}GetAllByIsProductive/${isProductive}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get productivity time records"));
    return [];
  }

  return (await readJson<TimeRecord[]>(res)) ?? [];
}

export async function createTimeRecord(
  dto: CreateTimeRecordDto,
): Promise<TimeRecord | null> {
  const res = await fetch(`${url}Create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(toRqtTimeRecord(dto)),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to create time record"));
  return await readJson<TimeRecord>(res);
}

export async function updateTimeRecord(
  id: number,
  dto: CreateTimeRecordDto,
): Promise<TimeRecord | null> {
  const res = await fetch(`${url}Update/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(toRqtTimeRecord(dto)),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to update time record"));
  return await readJson<TimeRecord>(res);
}

export async function deleteTimeRecord(id: number): Promise<boolean> {
  const res = await fetch(`${url}Delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to delete time record"));
  return true;
}

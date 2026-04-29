import { API_BASE, readJson } from "@/lib/api";
import { ScheduleEvent } from "@/interfaces/interface";

const url = `${API_BASE}Calendar/`;

export type CreateCalendarDto = {
  userId: number;
  title: string;
  location: string;
  note: string;
  when: string;
  isDeleted: boolean;
};

export async function getCalendarByUserId(
  userId: number
): Promise<ScheduleEvent[]> {
  const res = await fetch(`${url}GetAllByUserId/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await readJson<ScheduleEvent[]>(res)) ?? [];

  return data
    .filter((event) => !event.isDeleted)
    .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
}

export async function createCalendarEvent(dto: CreateCalendarDto) {
  const res = await fetch(`${url}Create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await readJson<ScheduleEvent>(res);
}

export async function deleteCalendarEvent(id: number) {
  const res = await fetch(`${url}Delete/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
}
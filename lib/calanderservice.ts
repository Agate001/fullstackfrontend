import { CreateCalendarEventDto, ScheduleEvent } from "@/interfaces/interface";
import { API_BASE, readError, readJson } from "@/lib/api";
import { authHeaders } from "@/lib/userservice";

const url = `${API_BASE}Calendar/`;

type RqtCalendarEventBody = {
  UserId: number;
  Title: string;
  Location: string;
  Note: string;
  When: string;
};

const toRqtCalendarEvent = (dto: CreateCalendarEventDto): RqtCalendarEventBody => ({
  UserId: dto.userId,
  Title: dto.title,
  Location: dto.location,
  Note: dto.note,
  When: dto.when,
});

export async function getAllCalendarEvents(): Promise<ScheduleEvent[]> {
  const res = await fetch(`${url}GetAll`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get calendar events"));
    return [];
  }

  return ((await readJson<ScheduleEvent[]>(res)) ?? []).filter((event) => !event.isDeleted);
}

export async function getCalendarEventById(
  id: number,
): Promise<ScheduleEvent | null> {
  const res = await fetch(`${url}GetOne/Id/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get calendar event"));
    return null;
  }

  return await readJson<ScheduleEvent>(res);
}

export async function getCalendarByUserId(
  userId: number,
): Promise<ScheduleEvent[]> {
  const res = await fetch(`${url}GetAll/UserId/${userId}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get user calendar events"));
    return [];
  }

  const data = (await readJson<ScheduleEvent[]>(res)) ?? [];
  return data
    .filter((event) => !event.isDeleted)
    .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
}

export async function createCalendarEvent(dto: CreateCalendarEventDto) {
  const res = await fetch(`${url}Create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(toRqtCalendarEvent(dto)),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to create event"));
  return await readJson<ScheduleEvent>(res);
}

export async function updateCalendarEvent(id: number, dto: CreateCalendarEventDto) {
  const res = await fetch(`${url}Update/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(toRqtCalendarEvent(dto)),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to update event"));
  return await readJson<ScheduleEvent>(res);
}

export async function deleteCalendarEvent(id: number) {
  const res = await fetch(`${url}Delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await readError(res, "Failed to delete event"));
  return true;
}

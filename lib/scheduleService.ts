import { DailyScheduleItem, ScheduleEvent, TimeRecord } from "@/interfaces/interface";
import {
  createTimeRecord,
  getTimeRecordsByUserId,
  deleteTimeRecord,
} from "@/lib/timeRecordService";

const EVENT_KEY_PREFIX = "schedule_events";

function getEventKey(userId: number) {
  return `${EVENT_KEY_PREFIX}_${userId}`;
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function parseDurationToSeconds(value: string): number {
  if (!value) return 0;

  const [hours = "0", minutes = "0", seconds = "0"] = value.split(":");

  const total =
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(parseFloat(seconds));

  return Number.isFinite(total) ? total : 0;
}

function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");

  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");

  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function formatMinutesAsGoal(minutes: number): string {
  return formatSeconds(minutes * 60);
}

function normalizeCategory(name: string) {
  return name.trim().toLowerCase();
}

function getRecordTimestamp(record: TimeRecord) {
  return new Date(record.stopped || record.started || 0).getTime();
}

type CategoryState = {
  id: string;
  userId: number;
  name: string;
  minutes: number;
  lastUpdated: number;
  isDeleted: boolean;
};

export async function getDailySchedule(
  userId: number
): Promise<DailyScheduleItem[]> {
  const records = await getTimeRecordsByUserId(userId);

  const deletedCategories = records
    .filter((record) => record.isDeleted)
    .map((record) => normalizeCategory(record.category));

  const activeRecords = records.filter(
    (record) =>
      !record.isDeleted &&
      !deletedCategories.some(
        (category) => category === normalizeCategory(record.category)
      )
  );

  const grouped = new Map<string, CategoryState>();

  const sorted = [...activeRecords].sort(
    (a, b) => getRecordTimestamp(a) - getRecordTimestamp(b)
  );

  for (const record of sorted) {
    const category = record.category.trim();
    if (!category) continue;

    const key = normalizeCategory(category);
    const goalSeconds = parseDurationToSeconds(record.goal);
    const timestamp = getRecordTimestamp(record);

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: String(record.id ?? crypto.randomUUID()),
        userId: record.userId,
        name: category,
        minutes: 0,
        lastUpdated: timestamp,
        isDeleted: false,
      });
    }

    const existing = grouped.get(key)!;

    if (goalSeconds > 0) {
      existing.id = String(record.id ?? existing.id);
      existing.userId = record.userId;
      existing.name = category;
      existing.minutes = Math.max(1, Math.round(goalSeconds / 60));
      existing.lastUpdated = timestamp;
      existing.isDeleted = false;
    }
  }

  return Array.from(grouped.values())
    .filter((item) => item.minutes > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, userId, name, minutes }) => ({
      id,
      userId,
      name,
      minutes,
    }));
}

export async function saveDailyScheduleItem(
  userId: number,
  name: string,
  minutes: number,
  isProductive: boolean
): Promise<DailyScheduleItem[]> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Task name is required");
  }

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error("Minutes must be greater than 0");
  }

  const now = new Date().toISOString();

  await createTimeRecord({
    userId,
    started: now,
    stopped: now,
    length: "00:00:00",
    goal: formatMinutesAsGoal(minutes),
    category: trimmedName,
    tags: [trimmedName],
    isProductive,
    isDeleted: false,
  });

  return await getDailySchedule(userId);
}

export async function removeDailyScheduleItem(
  userId: number,
  item: DailyScheduleItem
): Promise<DailyScheduleItem[]> {
  await deleteTimeRecord(Number(item.id));

  return await getDailySchedule(userId);
}

export function getEvents(userId: number): ScheduleEvent[] {
  const key = getEventKey(userId);
  const data = safeRead<ScheduleEvent[]>(key, []);

  return data.sort((a, b) => {
    const left = new Date(a.when).getTime();
    const right = new Date(b.when).getTime();
    return left - right;
  });
}

export function addEvent(userId: number, event: Omit<ScheduleEvent, "id">) {
  const key = getEventKey(userId);
  const updated = [...getEvents(userId), { ...event, id: crypto.randomUUID() }];
  write(key, updated);
  return updated;
}

export function getTodayEvent(userId: number) {
  const today = new Date().toDateString();

  return (
    getEvents(userId).find((event) => {
      const eventDate = new Date(event.when);
      return eventDate.toDateString() === today;
    }) ?? null
  );
}

export function getNextEvent(userId: number) {
  const now = Date.now();

  return (
    getEvents(userId).find((event) => new Date(event.when).getTime() >= now) ??
    null
  );
}

export function formatMinutes(minutes: number) {
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
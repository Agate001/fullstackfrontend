import { CreateTimeRecordDto } from "@/interfaces/interface";
import { createTimeRecord } from "@/lib/timeRecordService";

const ACTIVE_TIMER_KEY_PREFIX = "active_timer";

type StoredTimer = {
  category: string;
  startedAt: string;
  isProductive: boolean;
  goal: string;
};

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(safe % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function buildRecord(userId: number, timer: StoredTimer): CreateTimeRecordDto {
  const start = new Date(timer.startedAt);
  const end = new Date();
  const durationSeconds = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 1000),
  );

  return {
    userId,
    category: timer.category,
    started: start.toISOString(),
    stopped: end.toISOString(),
    length: formatSeconds(durationSeconds),
    goal: timer.goal || "00:00:00",
    tags: [timer.category],
    isProductive: timer.isProductive,
    isDeleted: false,
  };
}

export async function logoutAndClearLocalStorage() {
  if (typeof window === "undefined") return;

  const timerKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith(`${ACTIVE_TIMER_KEY_PREFIX}_`),
  );

  for (const key of timerKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    const userId = Number(key.replace(`${ACTIVE_TIMER_KEY_PREFIX}_`, ""));
    if (!Number.isFinite(userId)) continue;

    try {
      const timer = JSON.parse(raw) as StoredTimer;

      if (timer?.category && timer?.startedAt) {
        await createTimeRecord(buildRecord(userId, timer));
      }
    } catch (error) {
      console.error("Could not save active timer before logout:", error);
    }
  }

  localStorage.clear();
}

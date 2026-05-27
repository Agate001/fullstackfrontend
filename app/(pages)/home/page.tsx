"use client";

import NavBarComponent from "@/components/nav";
import { DailyScheduleItem, TimeRecord, UserData } from "@/interfaces/interface";
import { getDailySchedule } from "@/lib/scheduleService";
import { createTimeRecord, getTimeRecordsByUserId } from "@/lib/timeRecordService";
import { loggedInData } from "@/lib/userservice";
import { CheckSquare, Play, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ActiveTimer = {
  category: string;
  startedAt: string;
  isProductive: boolean;
  goal: string;
};

const ACTIVE_TIMER_KEY_PREFIX = "active_timer";

function getActiveTimerKey(userId: number) {
  return `${ACTIVE_TIMER_KEY_PREFIX}_${userId}`;
}

function readActiveTimer(userId: number): ActiveTimer | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(getActiveTimerKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ActiveTimer;
  } catch {
    return null;
  }
}

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(safe % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getRecordDurationSeconds(record: TimeRecord) {
  if (!record.length || record.isDeleted) return 0;

  const [hours = "0", minutes = "0", seconds = "0"] = record.length.split(":");

  const total =
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number.parseFloat(seconds);

  return Number.isFinite(total) ? total : 0;
}

function isToday(record: TimeRecord) {
  const today = new Date().toISOString().split("T")[0];
  return record.started?.startsWith(today) ?? false;
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [scheduleItems, setScheduleItems] = useState<DailyScheduleItem[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = loggedInData();

    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const storedTimer = readActiveTimer(currentUser.id);
    setActiveTimer(storedTimer);

    const loadData = async () => {
      try {
        const [dailySchedule, timeData] = await Promise.all([
          getDailySchedule(currentUser.id),
          getTimeRecordsByUserId(currentUser.id),
        ]);

        setScheduleItems(dailySchedule);
        setRecords(timeData.filter(isToday));
        setSelectedCategory(storedTimer?.category || dailySchedule[0]?.name || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () => {
      const startedMs = Date.parse(activeTimer.startedAt);

      const diff = Number.isFinite(startedMs)
        ? Math.floor((Date.now() - startedMs) / 1000)
        : 0;

      setElapsedSeconds(Math.max(0, diff));
    };

    tick();

    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  const totalsByCategory = useMemo(() => {
    return records.reduce<Record<string, number>>((acc, record) => {
      const key = record.category || "Other";
      acc[key] = (acc[key] ?? 0) + getRecordDurationSeconds(record);
      return acc;
    }, {});
  }, [records]);

  const taskProgress = useMemo(() => {
    return scheduleItems.map((item) => {
      const actual = totalsByCategory[item.name] ?? 0;
      const target = item.minutes * 60;

      const percent =
        target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;

      return {
        ...item,
        actual,
        target,
        percent,
      };
    });
  }, [scheduleItems, totalsByCategory]);

  const completed = taskProgress.filter((item) => item.percent >= 100);

  const totalSecondsToday = records.reduce(
    (sum, record) => sum + getRecordDurationSeconds(record),
    0
  );

  const targetSecondsToday = scheduleItems.reduce(
    (sum, item) => sum + item.minutes * 60,
    0
  );

  const liveTotalSecondsToday =
    totalSecondsToday + (activeTimer ? elapsedSeconds : 0);

  const progress = targetSecondsToday
    ? Math.min(100, Math.round((liveTotalSecondsToday / targetSecondsToday) * 100))
    : 0;

  const score = Math.floor(liveTotalSecondsToday / 60) + completed.length * 25;

  const selectedScheduleItem = scheduleItems.find(
    (item) => item.name === selectedCategory
  );

  const savedSeconds = totalsByCategory[selectedCategory] ?? 0;

  const liveSeconds =
    activeTimer?.category === selectedCategory ? elapsedSeconds : 0;

  const handleStart = () => {
    if (!user?.id || !selectedCategory || activeTimer) return;

    const timer: ActiveTimer = {
      category: selectedCategory,
      startedAt: new Date().toISOString(),
      isProductive: selectedCategory.toLowerCase() !== "free time",
      goal: formatSeconds((selectedScheduleItem?.minutes ?? 0) * 60),
    };

    localStorage.setItem(getActiveTimerKey(user.id), JSON.stringify(timer));
    setActiveTimer(timer);
  };

  const handleStop = async () => {
    if (!activeTimer || !user?.id) return;

    try {
      const stoppedAt = new Date();
      const startedMs = Date.parse(activeTimer.startedAt);

      const startedAt = Number.isFinite(startedMs)
        ? new Date(startedMs)
        : stoppedAt;

      const durationSeconds = Math.max(
        0,
        Math.floor((stoppedAt.getTime() - startedAt.getTime()) / 1000)
      );

      await createTimeRecord({
        userId: user.id,
        category: activeTimer.category,
        started: startedAt.toISOString(),
        stopped: stoppedAt.toISOString(),
        length: formatSeconds(durationSeconds),
        goal: activeTimer.goal || "00:00:00",
        tags: [activeTimer.category],
        isProductive: activeTimer.isProductive,
        isDeleted: false,
      });

      const [dailySchedule, refreshedRecords] = await Promise.all([
        getDailySchedule(user.id),
        getTimeRecordsByUserId(user.id),
      ]);

      setScheduleItems(dailySchedule);
      setRecords(refreshedRecords.filter(isToday));
      localStorage.removeItem(getActiveTimerKey(user.id));
      setActiveTimer(null);
      setElapsedSeconds(0);
    } catch (error) {
      console.error(error);
      alert("Could not save time record.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full px-4 py-4 text-[#111827] sm:px-6">
        <NavBarComponent />

        <div className="mt-8 rounded-2xl border border-[#efcba5] bg-white/70 p-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-4 text-[#111827] sm:px-6 lg:px-8">
      <NavBarComponent />

      <header className="mx-auto mb-6 w-full max-w-7xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Make Today Your Tomorrow
        </h1>

        <p className="mt-3 max-w-2xl text-base text-slate-700 sm:text-lg">
          Stay focused, track your progress, and build better habits every day.
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <section className="min-w-0 rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold text-[#b94a10]">
                Current Session
              </p>

              <div className="h-1 w-6 rounded-full bg-[#f05a1a]" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!!activeTimer}
              className="w-full rounded-xl border border-[#efcba5] bg-[#fff7ed] px-4 py-3 text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-64"
            >
              <option value="">All Categories</option>

              {scheduleItems.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
              What Are We Working On?
            </h2>

            <p className="mt-3 text-base text-slate-700 sm:text-lg">
              Pick a category and start your timer.
            </p>
          </div>

          <div className="rounded-2xl border border-[#efcba5] bg-[#fffaf4]/80 p-4 text-center sm:p-6 lg:p-8">
            <p className="text-xl font-bold text-[#b94a10]">Current Task</p>

            <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-[#f3c58e]" />

            <p className="mx-auto mt-6 max-w-full break-words text-2xl sm:text-3xl">
              {selectedCategory || "Choose a task"}
            </p>

            <p className="mt-5 text-base text-slate-700 sm:text-lg">
              Saved Time / Goal
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-1 text-4xl font-extrabold leading-none tracking-tight text-slate-950 sm:flex-row sm:gap-3">
              <span>{formatSeconds(savedSeconds + liveSeconds)}</span>

              <span className="text-2xl sm:text-xl">/</span>

              <span>
                {formatSeconds((selectedScheduleItem?.minutes ?? 0) * 60)}
              </span>
            </div>

            <button
              onClick={activeTimer ? handleStop : handleStart}
              disabled={!selectedCategory}
              className={`mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl px-8 py-4 text-base font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64 ${
                activeTimer
                  ? "bg-[#ef3f05] hover:bg-[#d93800]"
                  : "bg-[#31a31b] hover:bg-[#278315]"
              }`}
            >
              <Play size={20} fill="currentColor" />

              {activeTimer ? "Stop Focus Session" : "Start Focus Session"}
            </button>
          </div>
        </section>

        <aside className="min-w-0 space-y-5 rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6 lg:p-7">
          <p className="text-sm font-bold text-[#b94a10]">Daily Overview</p>

          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#fff0dd] text-[#d86b1f]">
              <Trophy size={34} />
            </div>

            <div>
              <p className="text-sm text-slate-700">Score</p>

              <p className="text-4xl font-extrabold">
                +{score}{" "}
                <span className="text-base font-semibold">pts</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#efcba5] bg-[#fffaf4]/80 p-5 sm:p-6">
            <p className="font-bold text-[#b94a10]">Percent Tracker</p>

            <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row">
              <div
                className="grid h-24 w-24 shrink-0 place-items-center rounded-full transition-all duration-300"
                style={{
                  background: `conic-gradient(#ef5b17 ${
                    progress * 3.6
                  }deg, #f0d7bd 0deg)`,
                }}
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-white">
                  <span className="text-sm font-bold text-[#b94a10]">
                    {progress}%
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <p className="text-4xl font-extrabold sm:text-5xl">
                  {progress}%
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {formatSeconds(liveTotalSecondsToday)} /{" "}
                  {formatSeconds(targetSecondsToday)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#efcba5] bg-[#fffaf4]/80 p-5 sm:p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0dd] text-[#d86b1f]">
              <CheckSquare size={30} />
            </div>

            {completed.length ? (
              <div className="space-y-3">
                {completed.map((item) => (
                  <p key={item.id} className="font-semibold">
                    {item.name} completed
                  </p>
                ))}
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-extrabold leading-tight">
                  No completed tasks yet.
                </h3>

                <p className="mt-3 text-base leading-relaxed text-slate-700">
                  Start a focus session to see your completed work here.
                </p>
              </>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
"use client";

import NavBarComponent from "@/components/nav";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DailyScheduleItem,
  TimeRecord,
  UserData,
} from "@/interfaces/interface";
import {
  createTimeRecord,
  getTimeRecordsByUserId,
} from "@/lib/timeRecordService";
import { getDailySchedule } from "@/lib/scheduleService";
import { loggedInData } from "@/lib/userservice";

type TaskItem = {
  name: string;
  percent: number;
  color?: string;
};

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

function safeReadActiveTimer(userId: number): ActiveTimer | null {
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
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getRecordDurationSeconds(record: TimeRecord) {
  if (!record.length || record.isDeleted) return 0;

  const [hours = "0", minutes = "0", seconds = "0"] = record.length.split(":");

  const total =
    Number(hours) * 3600 + Number(minutes) * 60 + Number(parseFloat(seconds));

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
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const currentUser = loggedInData();
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const storedTimer = safeReadActiveTimer(currentUser.id);
    setActiveTimer(storedTimer);

    const loadData = async () => {
      try {
        const [dailySchedule, timeData] = await Promise.all([
          getDailySchedule(currentUser.id),
          getTimeRecordsByUserId(currentUser.id),
        ]);

        setScheduleItems(dailySchedule);
        setRecords(timeData.filter(isToday));

        if (storedTimer?.category) {
          setSelectedCategory(storedTimer.category);
        } else if (dailySchedule.length > 0) {
          setSelectedCategory(dailySchedule[0].name);
        }
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
      const diff = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(activeTimer.startedAt).getTime()) / 1000,
        ),
      );
      setElapsedSeconds(diff);
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

  const workingOn: TaskItem[] = useMemo(() => {
    return scheduleItems.map((item) => {
      const actualSeconds = totalsByCategory[item.name] ?? 0;
      const targetSeconds = item.minutes * 60;
      const percent =
        targetSeconds > 0
          ? Math.round((actualSeconds / targetSeconds) * 100)
          : 0;

      return {
        name: item.name,
        percent,
        color: percent >= 100 ? "text-lime-600" : "text-red-500",
      };
    });
  }, [scheduleItems, totalsByCategory]);

  const completed: TaskItem[] = workingOn.filter((item) => item.percent >= 100);

  const totalSecondsToday = records.reduce(
    (sum, record) => sum + getRecordDurationSeconds(record),
    0,
  );

  const targetSecondsToday = scheduleItems.reduce(
    (sum, item) => sum + item.minutes * 60,
    0,
  );

  const progress = targetSecondsToday
    ? Math.min(100, Math.round((totalSecondsToday / targetSecondsToday) * 100))
    : 0;

  const score = Math.floor(totalSecondsToday / 60);
  const bonus = completed.length * 25;

  const selectedScheduleItem = scheduleItems.find(
    (item) => item.name === selectedCategory,
  );

  const backendSecondsForSelectedCategory =
    totalsByCategory[selectedCategory] ?? 0;

  const liveSecondsForSelectedCategory =
    activeTimer?.category === selectedCategory ? elapsedSeconds : 0;

  const displayCurrentTime = formatSeconds(
    backendSecondsForSelectedCategory + liveSecondsForSelectedCategory,
  );

  const displayTargetTime = formatSeconds(
    (selectedScheduleItem?.minutes ?? 0) * 60,
  );

  const handleStart = () => {
    if (!user?.id || !selectedCategory || activeTimer) return;

    const selectedScheduleItem = scheduleItems.find(
      (item) => item.name === selectedCategory,
    );

    const timer: ActiveTimer = {
      category: selectedCategory,
      startedAt: new Date().toISOString(),
      isProductive: selectedCategory !== "Free Time",
      goal: formatSeconds((selectedScheduleItem?.minutes ?? 0) * 60),
    };

    localStorage.setItem(getActiveTimerKey(user.id), JSON.stringify(timer));
    setActiveTimer(timer);
  };

  const handleStop = async () => {
    if (!activeTimer || !user?.id) return;

    try {
      const end = new Date();
      const start = new Date(activeTimer.startedAt);
      const durationSeconds = Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / 1000),
      );

      await createTimeRecord({
        userId: user.id,
        category: activeTimer.category,
        started: start.toISOString(),
        stopped: end.toISOString(),
        length: formatSeconds(durationSeconds),
        goal: activeTimer.goal || "00:00:00",
        tags: [activeTimer.category],
        isProductive: activeTimer.isProductive,
        isDeleted: false,
      });

      const refreshed = await getTimeRecordsByUserId(user.id);
      setRecords(refreshed.filter(isToday));

      const dailySchedule = await getDailySchedule(user.id);
      setScheduleItems(dailySchedule);

      localStorage.removeItem(getActiveTimerKey(user.id));
      setActiveTimer(null);
      setElapsedSeconds(0);
    } catch (error) {
      console.error(error);
      alert("Could not save time record.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Background.png)] bg-cover bg-center bg-no-repeat px-4 py-4 lg:px-6">
      <div className="w-full">
        <NavBarComponent />

        <div className="mb-3 flex h-17.5 w-full items-center justify-center bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Title.png)] bg-cover bg-center bg-no-repeat">
          <h1 className="font-large text-center text-[2.4rem] text-black">
            Make Today Your Tomorrow
          </h1>
        </div>

        <section className="grid w-full grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1.1fr_0.8fr]">
          <div className="h-140 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-6 shadow-md overflow-hidden">
            <h2 className="font-small mb-6 text-center text-[2.1rem] text-black">
              What Are We Working On
            </h2>

            <div className="h-[calc(100%-4rem)] space-y-6 overflow-y-auto px-6 pr-3">
              {workingOn.map((item) => (
                <div
                  key={item.name}
                  className="font-small flex items-center justify-between text-[1.8rem]"
                >
                  <span className="text-black">{item.name}</span>
                  <span className={item.color}>{item.percent}%</span>
                </div>
              ))}

              {!workingOn.length && !loading && (
                <p className="font-small text-center text-[1.6rem] text-black">
                  Add a daily schedule item on the schedule page.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="min-h-45 rounded-[28px] bg-[url('https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png')] bg-cover bg-center bg-no-repeat p-5 shadow-md overflow-hidden">
              <div className="grid h-full grid-cols-2 gap-6">
                <div>
                  <p className="font-small text-[1.9rem] text-black">Score</p>
                  <p className="font-small mt-3 text-[2.4rem] text-black">
                    +{score} Pts
                  </p>
                </div>

                <div>
                  <p className="font-small text-center text-[1.8rem] text-black">
                    Today
                  </p>

                  <div className="font-small mt-2 flex justify-between text-[1.4rem] text-black">
                    <span>{progress}%</span>
                    <span>progress</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-lime-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <span className="font-small text-[1.7rem] text-black">
                      +{bonus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-45 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-5 shadow-md overflow-hidden">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="font-small mb-3 border border-black bg-white px-3 py-1 text-[1.3rem] text-black"
                  disabled={!!activeTimer}
                >
                  {scheduleItems.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <p className="font-small mb-1 text-[1.2rem] text-black">
                  Saved Time / Goal
                </p>

                <p className="font-small mb-4 text-[2.2rem] text-black">
                  {displayCurrentTime} / {displayTargetTime}
                </p>

                {activeTimer ? (
                  <button
                    onClick={handleStop}
                    className="font-small rounded-2xl bg-red-600 px-10 py-2 text-[2rem] text-black shadow"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="font-small rounded-2xl bg-lime-500 px-10 py-2 text-[2rem] text-black shadow"
                    disabled={!scheduleItems.length || !selectedCategory}
                  >
                    Start
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-45 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat shadow-md overflow-hidden flex items-center justify-center px-6 text-center">
              <span className="font-small text-[1.8rem] text-black">
                {activeTimer
                  ? `Tracking ${activeTimer.category}`
                  : "Pick a category and start your timer."}
              </span>
            </div>
          </div>

          <div className="h-140 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-6 shadow-md overflow-hidden">
            <h2 className="font-small mb-6 text-center text-[2.1rem] text-black">
              Completed
            </h2>

            <div className="h-[calc(100%-4rem)] space-y-6 overflow-y-auto px-2 pr-3">
              {completed.map((item) => (
                <div
                  key={item.name}
                  className="font-small flex items-center justify-between text-[1.8rem] text-black"
                >
                  <span>{item.name}</span>
                  <span className={item.color}>{item.percent}%</span>
                </div>
              ))}

              {!completed.length && !loading && (
                <p className="font-small text-center text-[1.6rem] text-black">
                  No categories have reached their goal yet today.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="mt-3">
          <Link
            className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.4rem] text-black shadow"
            href="/"
          >
            Logout
          </Link>
        </div>
      </div>
    </main>
  );
}

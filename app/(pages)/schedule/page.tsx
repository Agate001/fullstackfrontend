"use client";

import NavBarComponent from "@/components/nav";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DailyScheduleItem, ScheduleEvent, UserData } from "@/interfaces/interface";
import { loggedInData } from "@/lib/userservice";
import {
  saveDailyScheduleItem,
  addEvent,
  formatMinutes,
  getDailySchedule,
  getEvents,
  getNextEvent,
  getTodayEvent,
  removeDailyScheduleItem,
} from "@/lib/scheduleService";

function formatEventLine(event: ScheduleEvent | null) {
  if (!event) return "Nothing Planned";
  const date = new Date(`${event.date}T${event.time}`);

  return `${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })} ${date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} ${event.title}${event.location ? ` • ${event.location}` : ""}`;
}

export default function SchedulePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [dailySchedule, setDailySchedule] = useState<DailyScheduleItem[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    const currentUser = loggedInData();
    if (!currentUser?.id) return;

    setUser(currentUser);

    const loadData = async () => {
      const schedule = await getDailySchedule(currentUser.id);
      setDailySchedule(schedule);
      setEvents(getEvents(currentUser.id));
    };

    loadData();
  }, []);

  const todayPlan = useMemo(() => {
    if (!user?.id) return formatEventLine(null);
    return formatEventLine(getTodayEvent(user.id));
  }, [events, user]);

  const nextWeekPlan = useMemo(() => {
    if (!user?.id) return formatEventLine(null);
    return formatEventLine(getNextEvent(user.id));
  }, [events, user]);

  const handleAddDaily = async () => {
    if (!user?.id) return;

    const name = window.prompt("Category name?");
    if (!name?.trim()) return;

    const minutesRaw = window.prompt("How many minutes?", "60");
    const minutes = Number(minutesRaw);

    if (!minutes || minutes <= 0) {
      alert("Please enter a valid minute amount.");
      return;
    }

    try {
      setDailySchedule(await saveDailyScheduleItem(user.id, name, minutes));
    } catch (error) {
      console.error(error);
      alert("Could not create category.");
    }
  };

  const handleRemoveDaily = async (item: DailyScheduleItem) => {
    if (!user?.id) return;

    try {
      setDailySchedule(await removeDailyScheduleItem(user.id, item));
    } catch (error) {
      console.error(error);
      alert("Could not remove category.");
    }
  };

  const handleAddEvent = () => {
    if (!user?.id) return;

    const title = window.prompt("Event title?");
    if (!title?.trim()) return;

    const date = window.prompt("Date? Use YYYY-MM-DD", new Date().toISOString().split("T")[0]);
    if (!date?.trim()) return;

    const time = window.prompt("Time? Use HH:mm", "18:00");
    if (!time?.trim()) return;

    const location = window.prompt("Location?", "") ?? "";

    setEvents(
      addEvent(user.id, {
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
      })
    );
  };

  return (
    <main className="min-h-screen w-full bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Background.png)] bg-cover bg-center bg-no-repeat px-4 py-4 lg:px-6">
      <div className="w-full">
        <NavBarComponent />

        <div className="mb-4 flex h-17.5 w-full items-center justify-center bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Title.png)] bg-cover bg-center bg-no-repeat">
          <h1 className="font-large text-center text-[2.4rem] text-black">
            Plan the Future to Know Your Future
          </h1>
        </div>

        <section className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.35fr]">
          <div className="h-140 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-6 shadow-md overflow-hidden">
            <h2 className="font-small mb-8 text-center text-[2rem] text-black">
              Daily Schedule
            </h2>

            <div className="flex h-[calc(100%-5rem)] flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {dailySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveDaily(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-[1.6rem] leading-none text-white"
                      >
                        ×
                      </button>

                      <span className="font-small text-[1.7rem] text-black">
                        {item.name}
                      </span>
                    </div>

                    <span className="font-small text-[1.4rem] text-black">
                      {formatMinutes(item.minutes)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <span className="font-small text-[1.5rem] text-black">
                  Add Daily?
                </span>

                <button
                  type="button"
                  onClick={handleAddDaily}
                  className="flex h-10 w-10 items-center justify-center bg-[#d9d9d9] text-[2rem] leading-none text-black shadow"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="h-115 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-8 shadow-md overflow-hidden">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <h2 className="font-small text-[3.2rem] text-black">
                  Today
                </h2>

                <p className="font-small mt-2 text-[2.2rem] text-black">
                  {todayPlan}
                </p>

                <h2 className="font-small mt-14 text-[3.2rem] text-black">
                  Up Next
                </h2>

                <p className="font-small mt-2 text-[2.2rem] text-black">
                  {nextWeekPlan}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAddEvent}
                className="font-small min-w-65 rounded-lg bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat px-10 py-5 text-[2rem] text-black shadow-md"
              >
                Add Event ?
              </button>
            </div>
          </div>
        </section>

        <div className="mt-4">
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

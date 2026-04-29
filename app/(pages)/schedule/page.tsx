"use client";

import NavBarComponent from "@/components/nav";
import AddDailyPopup from "@/components/AddDailyPopup";
import Link from "next/link";
import MessagePopup from "@/components/MessagePopUp";
import { useEffect, useMemo, useState } from "react";
import {
  DailyScheduleItem,
  ScheduleEvent,
  UserData,
} from "@/interfaces/interface";
import { loggedInData } from "@/lib/userservice";
import AddEventPopup from "@/components/AddEventPopup";
import {
  createCalendarEvent,
  getCalendarByUserId,
  deleteCalendarEvent,
} from "@/lib/calanderservice";
import {
  saveDailyScheduleItem,
  formatMinutes,
  getDailySchedule,
  removeDailyScheduleItem,
} from "@/lib/scheduleService";

function formatEventTime(event: ScheduleEvent) {
  const date = new Date(event.when);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventLine(event: ScheduleEvent | null) {
  if (!event) return "Nothing Planned";

  const date = new Date(event.when);

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
  const [showAddDailyPopup, setShowAddDailyPopup] = useState(false);
  const [showAddEventPopup, setShowAddEventPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  

  useEffect(() => {
    const currentUser = loggedInData();
    if (!currentUser?.id) return;

    setUser(currentUser);

    const loadData = async () => {
      const schedule = await getDailySchedule(currentUser.id);
      const calendarEvents = await getCalendarByUserId(currentUser.id);

      setDailySchedule(schedule);
      setEvents(calendarEvents);
    };

    loadData();
  }, []);

  const todayEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => {
        const eventDate = new Date(event.when);
        return eventDate.toDateString() === now.toDateString();
      })
      .sort(
        (a, b) => new Date(a.when).getTime() - new Date(b.when).getTime()
      );
  }, [events]);

  const nextWeekPlan = useMemo(() => {
    if (!events.length) return formatEventLine(null);

    const now = new Date();

    const upcoming = events
      .map((e) => ({ ...e, dateObj: new Date(e.when) }))
      .filter((e) => e.dateObj > now)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    return formatEventLine(upcoming[0] || null);
  }, [events]);

  const handleAddDaily = async (
    name: string,
    minutes: number,
    isProductive: boolean
  ) => {
    if (!user?.id) return;

    setDailySchedule(
      await saveDailyScheduleItem(user.id, name, minutes, isProductive)
    );
  };

  const handleRemoveDaily = async (item: DailyScheduleItem) => {
    if (!user?.id) return;

    try {
      setDailySchedule(await removeDailyScheduleItem(user.id, item));
    } catch (error) {
      console.error(error);
      setPopupMessage("Could not remove category.");
    }
  };

  const handleAddEvent = async (
    title: string,
    date: string,
    time: string,
    location: string
  ) => {
    if (!user?.id) return;

    await createCalendarEvent({
      userId: user.id,
      title: title.trim(),
      location: location.trim(),
      note: "",
      when: `${date}T${time}:00`,
      isDeleted: false,
    });

    setEvents(await getCalendarByUserId(user.id));
  };

  const handleDeleteEvent = async (event: ScheduleEvent) => {
  if (!user?.id) return;

  try {
    await deleteCalendarEvent(Number(event.id));

    setEvents((prev) => prev.filter((e) => e.id !== event.id));
  } catch (error) {
    console.error(error);
    setPopupMessage("Could not delete event.");
  }
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
          <div className="h-140 overflow-hidden rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-6 shadow-md">
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
                  onClick={() => setShowAddDailyPopup(true)}
                  className="flex h-10 w-10 items-center justify-center bg-[#d9d9d9] text-[2rem] leading-none text-black shadow"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="h-115 overflow-hidden rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-8 shadow-md">
              <div className="flex h-full flex-col text-center">
                <h2 className="font-small text-[3.2rem] text-black">Today</h2>

                <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
                  {todayEvents.length === 0 ? (
                    <p className="font-small text-[2.2rem] text-black">
                      Nothing Planned
                    </p>
                  ) : (
                    todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between gap-4 rounded-xl bg-[#f4ead8]/80 px-4 py-3 shadow"
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-[1.4rem] leading-none text-white"
                        >
                          ×
                        </button>

                        <div className="flex-1 text-left">
                          <p className="font-small text-[1.7rem] text-black">
                            {event.title}
                          </p>

                          <p className="font-small text-[1.2rem] text-black">
                            {formatEventTime(event)}
                            {event.location ? ` • ${event.location}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h2 className="font-small mt-6 text-[3.2rem] text-black">
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
                onClick={() => setShowAddEventPopup(true)}
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

      {showAddDailyPopup && (
        <AddDailyPopup
          onClose={() => setShowAddDailyPopup(false)}
          onSubmit={handleAddDaily}
        />
      )}

      {showAddEventPopup && (
        <AddEventPopup
          onClose={() => setShowAddEventPopup(false)}
          onSubmit={handleAddEvent}
        />
      )}
      <MessagePopup
  message={popupMessage}
  onClose={() => setPopupMessage("")}
/>
    </main>
  );
}
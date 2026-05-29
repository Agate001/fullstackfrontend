"use client";

import AddDailyPopup from "@/components/AddDailyPopup";
import CalanderEvents from "@/components/CalanderEvents";
import MessagePopup from "@/components/MessagePopUp";
import NavBarComponent from "@/components/nav";
import {
  DailyScheduleItem,
  ScheduleEvent,
  UserData,
} from "@/interfaces/interface";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarByUserId,
} from "@/lib/calanderservice";
import {
  formatMinutes,
  getDailySchedule,
  removeDailyScheduleItem,
  saveDailyScheduleItem,
} from "@/lib/scheduleService";
import { loggedInData } from "@/lib/userservice";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function parseLocalEventDate(event: ScheduleEvent) {
  const match = event.when?.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (!match) return new Date();

  const [, year, month, day, hour, minute] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
}

function getEventDateKey(event: ScheduleEvent) {
  return dateKey(parseLocalEventDate(event));
}

function getMonthDays(viewDate: Date, events: ScheduleEvent[]) {
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = first.getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const eventDays = new Set(events.map(getEventDateKey));

  const days: {
    label: string;
    date: Date;
    muted?: boolean;
    today?: boolean;
    hasEvent?: boolean;
  }[] = [];

  for (let i = leading - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);

    days.push({
      label: String(day),
      date,
      muted: true,
      today: dateKey(date) === dateKey(today),
      hasEvent: eventDays.has(dateKey(date)),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    days.push({
      label: String(day),
      date,
      today: dateKey(date) === dateKey(today),
      hasEvent: eventDays.has(dateKey(date)),
    });
  }

  while (days.length < 42) {
    const day = days.length - leading - daysInMonth + 1;
    const date = new Date(year, month + 1, day);

    days.push({
      label: String(day),
      date,
      muted: true,
      today: dateKey(date) === dateKey(today),
      hasEvent: eventDays.has(dateKey(date)),
    });
  }

  return {
    monthLabel: viewDate.toLocaleDateString([], {
      month: "long",
      year: "numeric",
    }),
    days,
  };
}

export default function SchedulePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [dailySchedule, setDailySchedule] = useState<DailyScheduleItem[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [showAddDailyPopup, setShowAddDailyPopup] = useState(false);
  const [showCalendarEventsPopup, setShowCalendarEventsPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    const currentUser = loggedInData();

    if (!currentUser?.id) return;

    setUser(currentUser);

    const loadData = async () => {
      try {
        const [schedule, calendarEvents] = await Promise.all([
          getDailySchedule(currentUser.id),
          getCalendarByUserId(currentUser.id),
        ]);

        setDailySchedule(schedule);
        setEvents(calendarEvents);
      } catch (error) {
        console.error(error);
        setPopupMessage("Could not load schedule.");
      }
    };

    loadData();
  }, []);

  const { monthLabel, days } = useMemo(
    () => getMonthDays(viewDate, events),
    [viewDate, events],
  );

  const selectedDayEvents = useMemo(() => {
    const selected = dateKey(selectedDate);

    return events
      .filter((event) => getEventDateKey(event) === selected)
      .sort(
        (a, b) =>
          parseLocalEventDate(a).getTime() -
          parseLocalEventDate(b).getTime(),
      );
  }, [events, selectedDate]);

  const selectedCount = dailySchedule.length;

  const possiblePoints = dailySchedule.reduce(
    (total, item) => total + (Number(item.minutes) || 0),
    0,
  );

  const handlePreviousMonth = () => {
    setViewDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setViewDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() + 1, 1);
    });
  };

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowCalendarEventsPopup(true);
  };

  const handleAddDaily = async (
    name: string,
    minutes: number,
    isProductive: boolean,
  ) => {
    if (!user?.id) return;

    try {
      setDailySchedule(
        await saveDailyScheduleItem(user.id, name, minutes, isProductive),
      );
    } catch (error) {
      console.error(error);
      setPopupMessage("Could not add task.");
    }
  };

  const handleRemoveDaily = async (item: DailyScheduleItem) => {
    if (!user?.id) return;

    try {
      setDailySchedule(await removeDailyScheduleItem(user.id, item));
    } catch (error) {
      console.error(error);
      setPopupMessage("Could not remove task.");
    }
  };

  const handleAddEvent = async (
    title: string,
    date: string,
    time: string,
    location: string,
  ) => {
    if (!user?.id) return;

    try {
      const when = `${date}T${time}:00`;

      await createCalendarEvent({
        userId: user.id,
        title: title.trim(),
        location: location.trim(),
        note: "",
        when,
      });

      const updatedEvents = await getCalendarByUserId(user.id);
      setEvents(updatedEvents);

      const [year, month, day] = date.split("-").map(Number);
      const newSelectedDate = new Date(year, month - 1, day);

      setSelectedDate(newSelectedDate);
      setViewDate(
        new Date(
          newSelectedDate.getFullYear(),
          newSelectedDate.getMonth(),
          1,
        ),
      );
    } catch (error) {
      console.error(error);
      setPopupMessage("Could not add event.");
    }
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
    <main className="min-h-screen w-full overflow-x-hidden px-3 py-3 text-[#111827] sm:px-5 sm:py-4 lg:px-6">
      <NavBarComponent />

      <header className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Daily Schedule
          </h1>

          <p className="mt-2 max-w-xl text-sm text-slate-700 sm:mt-3 sm:text-base">
            Pick the tasks you want to complete today. Scheduled events will
            show up on your calendar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#f0d7bd] bg-white/70 p-4 text-center shadow-sm sm:w-fit sm:min-w-[360px] sm:px-8 sm:py-5">
          <div>
            <p className="text-2xl font-extrabold sm:text-3xl">
              {selectedCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#1f5a88] sm:text-sm">
              Tasks Today
            </p>
          </div>

          <div>
            <p className="text-2xl font-extrabold sm:text-3xl">
              {possiblePoints}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#1f5a88] sm:text-sm">
              Possible Points
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.9fr] xl:gap-6">
        <div className="rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                Choose Today’s Tasks
              </h2>

              <p className="mt-2 text-sm text-[#1f5a88]">
                Select the tasks you want to complete today.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#fff0dd] px-3 py-1 text-sm font-bold text-[#ef3f05]">
              {selectedCount} selected
            </span>
          </div>

          <div className="space-y-3">
            {dailySchedule.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-[#f2ddc2] bg-[#fffaf4]/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="break-words font-bold">{item.name}</p>

                  <p className="mt-1 text-sm text-[#1f5a88]">
                    {formatMinutes(item.minutes)}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveDaily(item)}
                  className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-[#ef3f05] transition hover:bg-[#fff0dd]"
                  type="button"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}

            {!dailySchedule.length && (
              <p className="rounded-xl border border-dashed border-[#efcba5] bg-[#fffaf4]/80 px-5 py-8 text-center text-slate-700">
                No daily tasks yet.
              </p>
            )}
          </div>

          <button
            onClick={() => setShowAddDailyPopup(true)}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#f2ddc2] bg-[#fffaf4] px-5 py-4 font-semibold text-[#ef3f05] transition hover:bg-[#fff0dd]"
            type="button"
          >
            <Plus size={20} />
            Add Custom Task
          </button>
        </div>

        <div className="rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Calendar
              </h2>

              <p className="mt-1 text-sm text-[#1f5a88]">
                Click a day to add or view events.
              </p>
            </div>

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
              <button
                onClick={handlePreviousMonth}
                className="rounded-lg border border-[#f2ddc2] bg-[#fffaf4] p-2 transition hover:bg-[#fff0dd]"
                aria-label="Previous month"
                type="button"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-32 text-center text-sm font-bold sm:min-w-36 sm:text-base">
                {monthLabel}
              </span>

              <button
                onClick={handleNextMonth}
                className="rounded-lg border border-[#f2ddc2] bg-[#fffaf4] p-2 transition hover:bg-[#fff0dd]"
                aria-label="Next month"
                type="button"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-xs sm:gap-y-3 sm:text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <p key={day} className="font-bold text-[#1f5a88]">
                {day}
              </p>
            ))}

            {days.map((day, index) => {
              return (
                <button
                  key={`${day.label}-${index}`}
                  onClick={() => handleSelectDay(day.date)}
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-[#ef5b17] sm:h-11 sm:w-11"
                  title={
                    day.hasEvent
                      ? `Events on ${day.date.toLocaleDateString()}`
                      : day.date.toLocaleDateString()
                  }
                  type="button"
                >
                  <span
                    className={`relative grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition sm:h-10 sm:w-10 sm:text-sm ${
                      day.today
                        ? "bg-[#ef5b17] text-white shadow-sm"
                        : day.hasEvent
                          ? "bg-[#fff0dd] text-[#ef3f05] ring-2 ring-[#efcba5]"
                          : day.muted
                            ? "text-slate-400 hover:bg-[#fffaf4]"
                            : "text-slate-900 hover:bg-[#fffaf4]"
                    }`}
                  >
                    {day.label}

                    {day.hasEvent && (
                      <span
                        className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                          day.today ? "bg-white" : "bg-[#ef3f05]"
                        }`}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-[#f2ddc2] bg-[#fffaf4]/80 p-4 text-sm text-slate-700">
            <p>
              Days with an orange ring have scheduled events. Click any day to
              open its event popup.
            </p>
          </div>
        </div>
      </section>

      {showAddDailyPopup && (
        <AddDailyPopup
          onClose={() => setShowAddDailyPopup(false)}
          onSubmit={handleAddDaily}
        />
      )}

      <CalanderEvents
        isOpen={showCalendarEventsPopup}
        selectedDate={selectedDate}
        events={selectedDayEvents}
        onClose={() => setShowCalendarEventsPopup(false)}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <MessagePopup message={popupMessage} onClose={() => setPopupMessage("")} />
    </main>
  );
}
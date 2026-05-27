"use client";

import AddDailyPopup from "@/components/AddDailyPopup";
import AddEventPopup from "@/components/AddEventPopup";
import MessagePopup from "@/components/MessagePopUp";
import NavBarComponent from "@/components/nav";
import { DailyScheduleItem, ScheduleEvent, UserData } from "@/interfaces/interface";
import { createCalendarEvent, deleteCalendarEvent, getCalendarByUserId } from "@/lib/calanderservice";
import { formatMinutes, getDailySchedule, removeDailyScheduleItem, saveDailyScheduleItem } from "@/lib/scheduleService";
import { loggedInData } from "@/lib/userservice";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatEventTime(event: ScheduleEvent) {
  const timeMs = Date.parse(event.when);
  const date = Number.isFinite(timeMs) ? new Date(timeMs) : new Date();
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getMonthDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = first.getDay();

  const days: { label: string; muted?: boolean; today?: boolean }[] = [];
  const prevMonthDays = new Date(year, month, 0).getDate();

  for (let i = leading - 1; i >= 0; i--) days.push({ label: String(prevMonthDays - i), muted: true });
  for (let day = 1; day <= daysInMonth; day++) days.push({ label: String(day), today: day === now.getDate() });
  while (days.length < 42) days.push({ label: String(days.length - leading - daysInMonth + 1), muted: true });
  return { monthLabel: now.toLocaleDateString([], { month: "long", year: "numeric" }), days };
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
      const [schedule, calendarEvents] = await Promise.all([
        getDailySchedule(currentUser.id),
        getCalendarByUserId(currentUser.id),
      ]);
      setDailySchedule(schedule);
      setEvents(calendarEvents);
    };

    loadData();
  }, []);

  const todayEvents = useMemo(() => {
    const today = new Date().toDateString();
    return events
      .filter((event) => new Date(Date.parse(event.when)).toDateString() === today)
      .sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
  }, [events]);

  const { monthLabel, days } = useMemo(() => getMonthDays(), []);
  const selectedCount = dailySchedule.length;

  const handleAddDaily = async (name: string, minutes: number, isProductive: boolean) => {
    if (!user?.id) return;
    setDailySchedule(await saveDailyScheduleItem(user.id, name, minutes, isProductive));
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

  const handleAddEvent = async (title: string, date: string, time: string, location: string) => {
    if (!user?.id) return;

    const when = new Date(`${date}T${time}:00`).toISOString();

    await createCalendarEvent({
      userId: user.id,
      title: title.trim(),
      location: location.trim(),
      note: "",
      when,
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
    <main className="min-h-screen w-full px-6 py-4 text-[#111827]">
      <NavBarComponent />

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Daily Schedule</h1>
          <p className="mt-3 max-w-xl text-slate-700">Pick the tasks you want to complete today. All tasks reset every day at midnight.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#f0d7bd] bg-white/62 px-12 py-5 text-center shadow-sm">
          <div>
            <p className="text-3xl font-extrabold">{selectedCount}</p>
            <p className="mt-1 text-sm text-[#1f5a88]">Tasks Today</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">{selectedCount * 25}</p>
            <p className="mt-1 text-sm text-[#1f5a88]">Possible Points</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="rounded-2xl border border-[#efcba5] bg-white/62 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Choose Today’s Tasks</h2>
              <p className="mt-2 text-sm text-[#1f5a88]">Select the tasks you want to complete today.</p>
            </div>
            <span className="text-sm font-bold text-[#ef3f05]">{selectedCount} selected</span>
          </div>

          <div className="space-y-3">
            {dailySchedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-[#f2ddc2] bg-[#fffaf4]/80 px-5 py-4">
                <label className="flex items-center gap-4 font-semibold">
                  <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#ef5b17]" />
                  <span>{item.name}</span>
                  <span className="text-sm font-normal text-slate-500">{formatMinutes(item.minutes)}</span>
                </label>
                <button onClick={() => handleRemoveDaily(item)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#ef3f05]">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            ))}

            {!dailySchedule.length && (
              <p className="rounded-lg border border-dashed border-[#efcba5] bg-[#fffaf4]/80 px-5 py-6 text-center text-slate-700">No daily tasks yet.</p>
            )}
          </div>

          <button onClick={() => setShowAddDailyPopup(true)} className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg border border-[#f2ddc2] bg-[#fffaf4] px-5 py-4 font-semibold text-[#ef3f05] transition hover:bg-[#fff0dd]">
            <Plus size={20} /> Add Custom Task
          </button>
        </div>

        <div className="rounded-2xl border border-[#efcba5] bg-white/62 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Calendar</h2>
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-[#f2ddc2] bg-[#fffaf4] p-2"><ChevronLeft size={18} /></button>
              <span className="min-w-36 text-center font-bold">{monthLabel}</span>
              <button className="rounded-lg border border-[#f2ddc2] bg-[#fffaf4] p-2"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <p key={day} className="font-bold text-[#1f5a88]">{day}</p>
            ))}
            {days.map((day, index) => (
              <div key={`${day.label}-${index}`} className={`mx-auto grid h-10 w-10 place-items-center rounded-full font-medium ${day.today ? 'bg-[#ef5b17] text-white' : day.muted ? 'text-slate-400' : 'text-slate-900'}`}>
                {day.label}
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border border-[#f2ddc2] bg-[#fffaf4]/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-extrabold"><CalendarDays size={18} /> Today</h3>
              <button onClick={() => setShowAddEventPopup(true)} className="text-sm font-bold text-[#ef3f05]">Add Event</button>
            </div>

            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                <p className="text-slate-700">Nothing planned today.</p>
              ) : (
                todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/80 p-3">
                    <div>
                      <p className="font-bold">{event.title}</p>
                      <p className="text-sm text-slate-600">{formatEventTime(event)}{event.location ? ` • ${event.location}` : ""}</p>
                    </div>
                    <button onClick={() => handleDeleteEvent(event)} className="text-[#ef3f05]"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {showAddDailyPopup && <AddDailyPopup onClose={() => setShowAddDailyPopup(false)} onSubmit={handleAddDaily} />}
      {showAddEventPopup && <AddEventPopup onClose={() => setShowAddEventPopup(false)} onSubmit={handleAddEvent} />}
      <MessagePopup message={popupMessage} onClose={() => setPopupMessage("")} />
    </main>
  );
}

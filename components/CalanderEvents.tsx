"use client";

import { ScheduleEvent } from "@/interfaces/interface";
import { CalendarDays, MapPin, Plus, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface CalanderEventsProps {
  isOpen: boolean;
  selectedDate: Date;
  events: ScheduleEvent[];
  onClose: () => void;
  onAddEvent: (
    title: string,
    date: string,
    time: string,
    location: string,
  ) => Promise<void> | void;
  onDeleteEvent: (event: ScheduleEvent) => Promise<void> | void;
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatEventTime(event: ScheduleEvent) {
  const when = event.when;

  if (!when) return "";

  const timeMatch = when.match(/T(\d{2}):(\d{2})/);

  if (timeMatch) {
    const [, hourString, minute] = timeMatch;
    const hour = Number(hourString);

    const displayHour = hour % 12 || 12;
    const period = hour >= 12 ? "PM" : "AM";

    return `${displayHour}:${minute} ${period}`;
  }

  return when;
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CalanderEvents({
  isOpen,
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onDeleteEvent,
}: CalanderEventsProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedDateValue = useMemo(
    () => toInputDate(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    if (!isOpen) return;

    setTitle("");
    setTime("12:00");
    setLocation("");
  }, [isOpen, selectedDateValue]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setIsSaving(true);

      await onAddEvent(title.trim(), selectedDateValue, time, location.trim());

      setTitle("");
      setTime("12:00");
      setLocation("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-3 py-6">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#efcba5] bg-[#fffaf4] p-4 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-extrabold">
              <CalendarDays size={22} />
              Day Events
            </h3>

            <p className="mt-1 text-sm font-semibold text-[#1f5a88]">
              {formatSelectedDate(selectedDate)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-[#fff0dd] hover:text-[#ef3f05]"
            aria-label="Close events popup"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-2xl border border-[#f2ddc2] bg-white/80 p-4"
        >
          <h4 className="mb-3 flex items-center gap-2 font-extrabold">
            <Plus size={18} />
            Add event
          </h4>

          <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="rounded-xl border border-[#f2ddc2] bg-[#fffaf4] px-4 py-3 text-sm outline-none transition focus:border-[#ef5b17] focus:ring-2 focus:ring-[#ffd7bd]"
            />

            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              type="time"
              className="rounded-xl border border-[#f2ddc2] bg-[#fffaf4] px-4 py-3 text-sm outline-none transition focus:border-[#ef5b17] focus:ring-2 focus:ring-[#ffd7bd]"
            />
          </div>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location optional"
            className="mt-3 w-full rounded-xl border border-[#f2ddc2] bg-[#fffaf4] px-4 py-3 text-sm outline-none transition focus:border-[#ef5b17] focus:ring-2 focus:ring-[#ffd7bd]"
          />

          <button
            disabled={isSaving || !title.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef5b17] px-4 py-3 font-bold text-white transition hover:bg-[#d94c0f] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
          >
            <Plus size={18} />
            {isSaving ? "Adding..." : "Add Event"}
          </button>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold">Events for this day</h4>

            <span className="rounded-full bg-[#fff0dd] px-3 py-1 text-xs font-bold text-[#ef3f05]">
              {events.length} event{events.length === 1 ? "" : "s"}
            </span>
          </div>

          {events.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#efcba5] bg-white/60 px-4 py-6 text-center text-sm text-slate-700 sm:text-base">
              Nothing planned for this day.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#f2ddc2] bg-white/80 p-4"
              >
                <div className="min-w-0">
                  <p className="break-words font-extrabold">{event.title}</p>

                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                    <span>{formatEventTime(event)}</span>

                    {event.location && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => onDeleteEvent(event)}
                  className="shrink-0 rounded-xl p-2 text-[#ef3f05] transition hover:bg-[#fff0dd]"
                  aria-label={`Delete ${event.title}`}
                  type="button"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
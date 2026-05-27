"use client";

import { CalendarPlus, Clock3, MapPin, X } from "lucide-react";
import { useState } from "react";

type AddEventPopupProps = {
  onClose: () => void;
  onSubmit: (
    title: string,
    date: string,
    time: string,
    location: string,
  ) => Promise<void>;
};

export default function AddEventPopup({ onClose, onSubmit }: AddEventPopupProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("18:00");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    if (!date.trim() || !time.trim()) {
      setError("Please enter a date and time.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSubmit(title.trim(), date.trim(), time.trim(), location.trim());
      onClose();
    } catch (error) {
      console.error(error);
      setError("Could not create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#efcba5] bg-[#fffaf4] shadow-[0_24px_80px_rgba(120,70,20,0.22)]">
        <div className="flex items-start justify-between border-b border-[#f2ddc2] bg-white/75 px-7 py-6">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0dd] text-[#ef3f05]">
              <CalendarPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827]">Add Event</h2>
              <p className="mt-1 text-sm text-slate-600">Schedule something for your calendar.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-[#fff0dd] hover:text-[#ef3f05]"
            aria-label="Close add event popup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-7 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#b94a10]">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#f2ddc2] bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef8a55] focus:ring-4 focus:ring-[#fff0dd]"
              placeholder="Example: Group meeting"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#b94a10]">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[#f2ddc2] bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#ef8a55] focus:ring-4 focus:ring-[#fff0dd]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#b94a10]">Time</span>
              <div className="flex items-center gap-3 rounded-xl border border-[#f2ddc2] bg-white px-4 py-3 transition focus-within:border-[#ef8a55] focus-within:ring-4 focus-within:ring-[#fff0dd]">
                <Clock3 size={18} className="text-slate-500" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none"
                />
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#b94a10]">Location</span>
            <div className="flex items-center gap-3 rounded-xl border border-[#f2ddc2] bg-white px-4 py-3 transition focus-within:border-[#ef8a55] focus-within:ring-4 focus-within:ring-[#fff0dd]">
              <MapPin size={18} className="text-slate-500" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Optional"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#f2ddc2] bg-white/65 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#f2ddc2] bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#fffaf4]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-[#ef3f05] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d93800] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

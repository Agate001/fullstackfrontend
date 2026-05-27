"use client";

import { CheckCircle2, Clock3, ListPlus, X } from "lucide-react";
import { useState } from "react";

type AddDailyPopupProps = {
  onClose: () => void;
  onSubmit: (
    name: string,
    minutes: number,
    isProductive: boolean,
  ) => Promise<void>;
};

export default function AddDailyPopup({
  onClose,
  onSubmit,
}: AddDailyPopupProps) {
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState("60");
  const [isProductive, setIsProductive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const minuteValue = Number(minutes);

    if (!name.trim()) {
      setError("Please enter a task name.");
      return;
    }

    if (!Number.isFinite(minuteValue) || minuteValue <= 0) {
      setError("Please enter a valid minute amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSubmit(name.trim(), minuteValue, isProductive);
      onClose();
    } catch (error) {
      console.error(error);
      setError("Could not create task. Please try again.");
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
              <ListPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827]">Add Daily Task</h2>
              <p className="mt-1 text-sm text-slate-600">Create a task you can pick and complete today.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-[#fff0dd] hover:text-[#ef3f05]"
            aria-label="Close add daily task popup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-7 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#b94a10]">Task Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#f2ddc2] bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef8a55] focus:ring-4 focus:ring-[#fff0dd]"
              placeholder="Example: Study JavaScript"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#b94a10]">Goal Time</span>
            <div className="flex items-center gap-3 rounded-xl border border-[#f2ddc2] bg-white px-4 py-3 transition focus-within:border-[#ef8a55] focus-within:ring-4 focus-within:ring-[#fff0dd]">
              <Clock3 size={18} className="text-slate-500" />
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                type="number"
                min="1"
                className="w-full bg-transparent text-slate-900 outline-none"
                placeholder="60"
              />
              <span className="text-sm font-semibold text-slate-500">minutes</span>
            </div>
          </label>

          <div>
            <span className="mb-2 block text-sm font-bold text-[#b94a10]">Task Type</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsProductive(true)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  isProductive
                    ? "border-[#ef8a55] bg-[#fff0dd] text-[#b94a10] shadow-sm"
                    : "border-[#f2ddc2] bg-white text-slate-600 hover:bg-white/70"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={17} /> Productive
                </div>
                <p className="mt-1 text-xs">Counts toward progress.</p>
              </button>

              <button
                type="button"
                onClick={() => setIsProductive(false)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  !isProductive
                    ? "border-[#ef8a55] bg-[#fff0dd] text-[#b94a10] shadow-sm"
                    : "border-[#f2ddc2] bg-white text-slate-600 hover:bg-white/70"
                }`}
              >
                <div className="font-bold">Not Productive</div>
                <p className="mt-1 text-xs">Track it without points.</p>
              </button>
            </div>
          </div>

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
            {loading ? "Saving..." : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

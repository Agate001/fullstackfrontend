"use client";

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
      setError("Could not create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-8 shadow-xl">
        <h2 className="font-small mb-6 text-center text-[2rem] text-black">
          Add Event
        </h2>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
            placeholder="Example: Meeting"
          />
        </div>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">
            Location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
            placeholder="Optional"
          />
        </div>

        {error && <p className="mt-4 text-center text-red-700">{error}</p>}

        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#d9d9d9] px-6 py-2 text-black shadow"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-[#f4ead8] px-6 py-2 text-black shadow disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";

type AddDailyPopupProps = {
  onClose: () => void;
  onSubmit: (
    name: string,
    minutes: number,
    isProductive: boolean
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
      setError("Please enter a category name.");
      return;
    }

    if (!minuteValue || minuteValue <= 0) {
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
      setError("Could not create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-8 shadow-xl">
        <h2 className="font-small mb-6 text-center text-[2rem] text-black">
          Add Daily
        </h2>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">
            Category Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
            placeholder="Example: Study"
          />
        </div>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">
            Minutes
          </label>

          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            type="number"
            min="1"
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
            placeholder="60"
          />
        </div>

        <div className="mb-4">
          <label className="font-small text-[1.2rem] text-black">
            Productivity
          </label>

          <select
            value={isProductive ? "productive" : "notProductive"}
            onChange={(e) => setIsProductive(e.target.value === "productive")}
            className="mt-1 w-full rounded-lg border border-[#9b7b56] bg-[#f4ead8] px-4 py-2 text-black outline-none"
          >
            <option value="productive">Productive</option>
            <option value="notProductive">Not Productive</option>
          </select>
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
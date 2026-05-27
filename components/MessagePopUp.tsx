"use client";

import { X } from "lucide-react";

type MessagePopupProps = {
  message: string;
  onClose: () => void;
};

export default function MessagePopup({
  message,
  onClose,
}: MessagePopupProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-[#efcba5] bg-[#fffaf4] p-5 text-center shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-[#111827]">
              Notice
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-[#fff0dd] hover:text-[#ef3f05]"
            aria-label="Close message"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rounded-2xl border border-[#f2ddc2] bg-white/80 px-4 py-6">
          <p className="text-base font-bold leading-relaxed text-slate-800 sm:text-lg">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#ef5b17] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#d94c0f]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
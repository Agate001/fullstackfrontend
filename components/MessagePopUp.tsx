"use client";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-8 text-center shadow-xl">
        <p className="font-small text-[1.5rem] text-black">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-lg bg-[#f4ead8] px-6 py-2 text-black shadow"
        >
          OK
        </button>
      </div>
    </div>
  );
}
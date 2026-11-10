"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** A panel that slides in from the right (side) or appears in the middle (dialog). */
export default function Panel({ title, onClose, children, variant = "side" }: {
  title: string; onClose: () => void; children: ReactNode; variant?: "side" | "dialog";
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const header = (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 px-5">
      <h2 className="font-semibold text-zinc-900">{title}</h2>
      <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
        <X size={18} />
      </button>
    </div>
  );

  if (variant === "dialog")
    return (
      <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4" onMouseDown={onClose}>
        <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
          {header}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    );

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-zinc-200 bg-white md:w-[360px]">
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

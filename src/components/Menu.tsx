"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

/** A small dropdown menu that opens from a trigger button. */
export default function Menu({ trigger, items, label, align = "right" }: {
  trigger: ReactNode; items: MenuItem[]; label: string; align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={label} title={label} aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
        {trigger}
      </button>
      {open && (
        <div className={`absolute z-30 mt-1 min-w-[190px] rounded-xl border border-zinc-200 bg-white p-1 shadow-lg ${align === "right" ? "right-0" : "left-0"}`}>
          {items.map((item) => (
            <button key={item.label} type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick(); }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-100"
              }`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b border-zinc-100 px-5 py-5 last:border-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/** A section that starts closed, so only the basics are visible at first. */
export function Collapsible({ title, children, defaultOpen = false, summary }: {
  title: string; children: ReactNode; defaultOpen?: boolean; summary?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-zinc-100">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex w-full items-center gap-2 px-5 py-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
        <span className="flex-1 text-left">{title}</span>
        {summary && !open && <span className="truncate text-xs font-normal text-zinc-500">{summary}</span>}
        <ChevronDown size={16} className={`shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-3 px-5 pb-5">{children}</div>}
    </section>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-sm text-zinc-700">
      <span>{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-indigo-600" : "bg-zinc-300"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg bg-zinc-100 p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
            value === o.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-zinc-500">{label}</span>
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-mono text-xs uppercase text-zinc-800 outline-none" />
      </span>
    </label>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-sm font-medium text-zinc-700">
        {label}
        <span className="font-normal text-zinc-500">{format ? format(value) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600" />
    </label>
  );
}

/** Reads an image file as a data URL (kept small so it fits in browser storage). */
export function readImage(file: File, maxBytes = 1_500_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`Image is too large. Please use one under ${Math.round(maxBytes / 1_000_000 * 10) / 10} MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

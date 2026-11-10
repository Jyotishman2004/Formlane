"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export default function EditorHeader({ formId, title, active, status, right }: {
  formId: string; title: string; active: "edit" | "responses"; status?: string; right?: ReactNode;
}) {
  const tab = (key: "edit" | "responses", label: string) => (
    <Link href={`/forms/${formId}/${key}`}
      className={`relative px-3 py-4 text-sm font-medium ${active === key ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}`}>
      {label}
      {active === key && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-indigo-600" />}
    </Link>
  );
  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-zinc-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link href="/" aria-label="Back to all forms" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-zinc-900">{title || "Untitled form"}</div>
          {status && <div className="text-xs text-zinc-400">{status}</div>}
        </div>
      </div>
      <nav className="flex">
        {tab("edit", "Questions")}
        {tab("responses", "Responses")}
      </nav>
      <div className="flex items-center justify-end gap-1">{right}</div>
    </header>
  );
}

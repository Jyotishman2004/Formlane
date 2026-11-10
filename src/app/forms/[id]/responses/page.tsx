"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, Inbox, Search, Star, Trash2 } from "lucide-react";
import type { Form, FormResponse, Question } from "@/lib/types";
import { closedReason, deleteResponse, getForm, listResponses } from "@/lib/store";
import { answerText, isEmpty } from "@/lib/logic";
import EditorHeader from "@/components/editor/EditorHeader";
import { Segmented } from "@/components/editor/ui";

export default function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null | undefined>(undefined);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [view, setView] = useState<"summary" | "table">("summary");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getForm(id).then(setForm);
    listResponses(id).then(setResponses);
  }, [id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return responses;
    return responses.filter((r) => Object.values(r.answers).some((v) => answerText(v).toLowerCase().includes(q)));
  }, [responses, query]);

  if (form === undefined) return null;
  if (form === null) return <div className="p-10 text-center">Form not found. <Link href="/" className="text-indigo-600">Go back</Link></div>;

  async function remove(r: FormResponse) {
    if (!confirm("Delete this response?")) return;
    await deleteResponse(r.id);
    setResponses((rs) => rs.filter((x) => x.id !== r.id));
  }

  const closed = closedReason(form, responses.length);
  const last = responses[0]?.submittedAt;

  return (
    <div className="flex min-h-screen flex-col">
      <EditorHeader formId={id} title={form.title} active="responses" right={
        <button onClick={() => downloadCsv(form, responses)} disabled={responses.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40">
          <Download size={14} /> <span className="hidden sm:inline">Download CSV</span>
        </button>
      } />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Responses" value={String(responses.length)} />
          <Stat label="Last response" value={last ? new Date(last).toLocaleString() : "—"} />
          <Stat label="Status" value={closed ? "Closed" : "Open"} tone={closed ? "muted" : "good"} />
        </div>

        {responses.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <Inbox className="mx-auto text-zinc-300" size={36} />
            <p className="mt-3 font-medium text-zinc-800">No responses yet</p>
            <p className="mt-1 text-sm text-zinc-500">Share your form and responses will appear here.</p>
            <Link href={`/f/${id}`} target="_blank" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800">
              Open the form →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="w-56">
                <Segmented value={view} onChange={setView} options={[{ value: "summary", label: "Summary" }, { value: "table", label: "All responses" }]} />
              </div>
              {view === "table" && (
                <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm">
                  <Search size={14} className="text-zinc-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search answers" className="w-48 outline-none" />
                </label>
              )}
            </div>

            {view === "summary" ? (
              <div className="mt-4 space-y-3">
                {form.questions.map((q, i) => <QuestionSummary key={q.id} index={i} question={q} responses={responses} />)}
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-xs text-zinc-500">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2.5 font-medium">Submitted</th>
                      {form.questions.map((q) => <th key={q.id} className="min-w-[160px] px-4 py-2.5 font-medium">{q.title}</th>)}
                      <th className="px-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filtered.map((r) => (
                      <tr key={r.id} className="align-top hover:bg-zinc-50">
                        <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">{new Date(r.submittedAt).toLocaleString()}</td>
                        {form.questions.map((q) => (
                          <td key={q.id} className="px-4 py-2.5 text-zinc-800">
                            {answerText(r.answers[q.id]) || <span className="text-zinc-300">—</span>}
                          </td>
                        ))}
                        <td className="px-2 py-2">
                          <button aria-label="Delete response" onClick={() => remove(r)} className="rounded p-1.5 text-zinc-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <p className="p-6 text-center text-sm text-zinc-500">No responses match “{query}”.</p>}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "muted" }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-0.5 truncate text-lg font-semibold ${tone === "good" ? "text-emerald-600" : tone === "muted" ? "text-zinc-500" : "text-zinc-900"}`}>
        {value}
      </div>
    </div>
  );
}

function QuestionSummary({ question: q, index, responses }: { question: Question; index: number; responses: FormResponse[] }) {
  const values = responses.map((r) => r.answers[q.id]).filter((v) => !isEmpty(v));

  let content;
  if (["multiple_choice", "checkboxes", "dropdown", "yes_no"].includes(q.type)) {
    const options = q.type === "yes_no" ? ["Yes", "No"] : q.options;
    const counts = new Map<string, number>(options.map((o) => [o, 0]));
    for (const v of values) for (const o of Array.isArray(v) ? v : [String(v)]) counts.set(o, (counts.get(o) ?? 0) + 1);
    const total = values.length || 1;
    content = (
      <div className="space-y-2">
        {[...counts].map(([o, n]) => (
          <div key={o}>
            <div className="flex justify-between text-sm"><span className="text-zinc-800">{o}</span><span className="text-zinc-500">{n} · {Math.round((n / total) * 100)}%</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(n / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (q.type === "rating" || q.type === "number") {
    const nums = values.map(Number).filter((n) => !Number.isNaN(n));
    const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    content = (
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-zinc-900">{nums.length ? avg.toFixed(1) : "—"}</span>
        <span className="text-sm text-zinc-500">
          {q.type === "rating" ? <>average out of {q.max} <Star size={12} className="inline -mt-0.5" fill="currentColor" /></> : "average"}
        </span>
      </div>
    );
  } else {
    content = (
      <ul className="space-y-1.5">
        {values.slice(0, 5).map((v, i) => <li key={i} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-800">{answerText(v)}</li>)}
        {values.length > 5 && <li className="text-xs text-zinc-500">+ {values.length - 5} more in “All responses”</li>}
      </ul>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-medium text-zinc-900">{index + 1}. {q.title}</h3>
        <span className="shrink-0 text-xs text-zinc-500">{values.length} {values.length === 1 ? "answer" : "answers"}</span>
      </div>
      {values.length ? content : <p className="text-sm text-zinc-400">No answers yet.</p>}
    </div>
  );
}

function downloadCsv(form: Form, responses: FormResponse[]) {
  // Prefix values that spreadsheets would run as formulas.
  const esc = (s: string) => `"${(/^[=+\-@\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
  const header = ["Submitted", ...form.questions.map((q) => q.title)];
  const rows = responses.map((r) => [new Date(r.submittedAt).toLocaleString(), ...form.questions.map((q) => answerText(r.answers[q.id]))]);
  const csv = [header, ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(form.title || "form").replace(/[^\w-]+/g, "_")}-responses.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

"use client";

import { useState } from "react";
import {
  AlignLeft, ArrowDown, ArrowUp, Calendar, CircleDot, Copy, GitBranch, Hash, Mail, MoreVertical, Phone, Plus,
  SquareCheck, SquareChevronDown, Star, ToggleLeft, Trash2, Type, X, type LucideIcon,
} from "lucide-react";
import type { Condition, Form, Question, QuestionType } from "@/lib/types";
import { QUESTION_TYPES, newQuestion } from "@/lib/questions";
import { CHOICE_TYPES } from "@/lib/logic";
import { uid } from "@/lib/id";
import Menu from "../Menu";
import { Toggle } from "./ui";

const ICONS: Record<QuestionType, LucideIcon> = {
  short_text: Type, long_text: AlignLeft, multiple_choice: CircleDot, checkboxes: SquareCheck,
  dropdown: SquareChevronDown, yes_no: ToggleLeft, rating: Star, email: Mail, phone: Phone, number: Hash, date: Calendar,
};

const plainInput = "w-full bg-transparent outline-none placeholder:text-zinc-400";

export default function QuestionList({ form, onChange }: { form: Form; onChange: (f: Form) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  // An empty form opens straight to the question picker.
  const [picking, setPicking] = useState(form.questions.length === 0);

  const setQuestions = (questions: Question[]) => onChange({ ...form, questions });
  const update = (id: string, patch: Partial<Question>) =>
    setQuestions(form.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  function add(type: QuestionType) {
    const q = newQuestion(type, "");
    q.title = "";
    setQuestions([...form.questions, q]);
    setSelected(q.id);
    setPicking(false);
  }

  function move(i: number, dir: -1 | 1) {
    const qs = [...form.questions];
    [qs[i], qs[i + dir]] = [qs[i + dir], qs[i]];
    setQuestions(qs);
  }

  function duplicate(i: number) {
    const qs = [...form.questions];
    const copy = { ...structuredClone(qs[i]), id: uid() };
    qs.splice(i + 1, 0, copy);
    setQuestions(qs);
    setSelected(copy.id);
  }

  function remove(id: string) {
    // Also drop any rules that depended on this question.
    setQuestions(form.questions.filter((q) => q.id !== id).map((q) => (q.showIf?.questionId === id ? { ...q, showIf: null } : q)));
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 px-4 py-8">
      {/* Title card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="h-2" style={{ background: form.theme.colors.accent }} />
        <div className="px-6 py-5">
          <input className={`${plainInput} text-2xl font-semibold text-zinc-900`} value={form.title} placeholder="Form title"
            onChange={(e) => onChange({ ...form, title: e.target.value })} />
          <textarea rows={1} className={`${plainInput} mt-1 resize-none text-zinc-600 [field-sizing:content]`} value={form.description}
            placeholder="Add a description (optional)" onChange={(e) => onChange({ ...form, description: e.target.value })} />
        </div>
      </div>

      {form.questions.map((q, i) =>
        selected === q.id ? (
          <EditCard key={q.id} q={q} index={i} total={form.questions.length} earlier={form.questions.slice(0, i)}
            onChange={(patch) => update(q.id, patch)} onMove={(d) => move(i, d)} onDuplicate={() => duplicate(i)}
            onDelete={() => remove(q.id)} />
        ) : (
          <button key={q.id} type="button" onClick={() => setSelected(q.id)}
            className="block w-full rounded-2xl bg-white px-6 py-5 text-left shadow-sm ring-1 ring-zinc-200 transition hover:ring-zinc-300">
            <div className="flex items-start gap-2">
              <span className="flex-1 font-medium text-zinc-900">
                {q.title || <span className="text-zinc-400">Untitled question</span>}
                {q.required && <span className="text-red-500"> *</span>}
              </span>
              {q.showIf && <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"><GitBranch size={11} /> Conditional</span>}
            </div>
            {q.description && <p className="mt-0.5 text-sm text-zinc-500">{q.description}</p>}
            <AnswerSketch q={q} />
          </button>
        ),
      )}

      {picking ? (
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-sm font-medium text-zinc-700">
              {form.questions.length === 0 ? "Choose your first question" : "Add a question"}
            </span>
            {form.questions.length > 0 && (
              <button type="button" onClick={() => setPicking(false)} aria-label="Cancel" className="rounded p-1 text-zinc-400 hover:text-zinc-800"><X size={16} /></button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {QUESTION_TYPES.map((t) => {
              const Icon = ICONS[t.type];
              return (
                <button key={t.type} type="button" onClick={() => add(t.type)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100">
                  <Icon size={16} className="text-zinc-500" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => { setPicking(true); setSelected(null); }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 py-4 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-800">
          <Plus size={18} /> Add question
        </button>
      )}
    </div>
  );
}

/** A quiet, read-only sketch of what the answer area looks like. */
function AnswerSketch({ q }: { q: Question }) {
  if (q.type === "multiple_choice" || q.type === "checkboxes" || q.type === "yes_no" || q.type === "dropdown") {
    const opts = q.type === "yes_no" ? ["Yes", "No"] : q.options;
    const mark = q.type === "checkboxes" ? "rounded-[3px]" : "rounded-full";
    return (
      <div className="mt-3 space-y-1.5">
        {opts.slice(0, 4).map((o, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-zinc-600">
            {q.type === "dropdown" ? <span className="text-zinc-400">{i + 1}.</span> : <span className={`h-3.5 w-3.5 border-2 border-zinc-300 ${mark}`} />}
            {o}
          </div>
        ))}
        {opts.length > 4 && <div className="text-xs text-zinc-400">+{opts.length - 4} more</div>}
      </div>
    );
  }
  if (q.type === "rating")
    return <div className="mt-3 flex gap-1 text-zinc-300">{Array.from({ length: q.max }, (_, i) => <Star key={i} size={20} fill="currentColor" />)}</div>;
  const label = QUESTION_TYPES.find((t) => t.type === q.type)?.label;
  return <div className={`mt-3 border-b border-dotted border-zinc-300 pb-1.5 text-sm text-zinc-400 ${q.type === "long_text" ? "w-full" : "w-1/2"}`}>{q.placeholder || label}</div>;
}

function EditCard({ q, index, total, earlier, onChange, onMove, onDuplicate, onDelete }: {
  q: Question; index: number; total: number; earlier: Question[];
  onChange: (p: Partial<Question>) => void; onMove: (d: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const [showHelp, setShowHelp] = useState(q.description !== "");
  const isChoice = CHOICE_TYPES.includes(q.type);
  const isText = ["short_text", "long_text", "email", "phone", "number"].includes(q.type);

  function changeType(type: QuestionType) {
    const options = CHOICE_TYPES.includes(type) && q.options.length === 0 ? ["Option 1", "Option 2"] : q.options;
    onChange({ type, options });
  }

  return (
    <div className="rounded-2xl bg-white shadow-md ring-2 ring-indigo-500">
      <div className="space-y-4 px-6 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <input autoFocus className="flex-1 rounded-lg bg-zinc-50 px-3 py-2.5 font-medium text-zinc-900 outline-none ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-400"
            value={q.title} placeholder="Type your question" onChange={(e) => onChange({ title: e.target.value })} />
          <select value={q.type} onChange={(e) => changeType(e.target.value as QuestionType)}
            className="rounded-lg bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-indigo-400 sm:w-48">
            {QUESTION_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
        </div>

        {showHelp && (
          <input className={`${plainInput} border-b border-zinc-200 pb-1.5 text-sm text-zinc-600 focus:border-indigo-400`}
            value={q.description} placeholder="Help text shown under the question" onChange={(e) => onChange({ description: e.target.value })} />
        )}

        {isChoice && <OptionsEditor type={q.type} options={q.options} onChange={(options) => onChange({ options })} />}
        {q.type === "yes_no" && <AnswerSketch q={q} />}
        {q.type === "date" && <AnswerSketch q={q} />}
        {isText && (
          <input className={`${plainInput} w-1/2 border-b border-dotted border-zinc-300 pb-1.5 text-sm text-zinc-500 focus:border-indigo-400`}
            value={q.placeholder} placeholder={`Hint text inside the box (optional)`} onChange={(e) => onChange({ placeholder: e.target.value })} />
        )}
        {q.type === "rating" && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1 text-amber-400">{Array.from({ length: q.max }, (_, i) => <Star key={i} size={20} fill="currentColor" />)}</div>
            <select value={q.max} onChange={(e) => onChange({ max: Number(e.target.value) })}
              className="rounded-lg px-2 py-1 text-sm text-zinc-600 ring-1 ring-zinc-200" aria-label="Number of stars">
              {[3, 4, 5, 7, 10].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
          </div>
        )}

        {q.showIf && <ConditionEditor c={q.showIf} earlier={earlier} onChange={(showIf) => onChange({ showIf })} />}
      </div>

      <div className="mt-5 flex items-center gap-1 border-t border-zinc-100 px-4 py-2 text-zinc-500">
        <IconBtn label="Move up" onClick={() => onMove(-1)} disabled={index === 0}><ArrowUp size={16} /></IconBtn>
        <IconBtn label="Move down" onClick={() => onMove(1)} disabled={index === total - 1}><ArrowDown size={16} /></IconBtn>
        <span className="flex-1" />
        <IconBtn label="Duplicate" onClick={onDuplicate}><Copy size={16} /></IconBtn>
        <button type="button" onClick={onDelete}
          className="mr-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          <Trash2 size={15} /> Delete question
        </button>
        <span className="mx-2 h-6 w-px bg-zinc-200" />
        <div className="w-28"><Toggle label="Required" checked={q.required} onChange={(required) => onChange({ required })} /></div>
        <Menu label="More options" trigger={<MoreVertical size={16} />} items={[
          showHelp
            ? { label: "Remove help text", icon: <X size={15} />, onClick: () => { setShowHelp(false); onChange({ description: "" }); } }
            : { label: "Add help text", icon: <AlignLeft size={15} />, onClick: () => setShowHelp(true) },
          q.showIf
            ? { label: "Always show this question", icon: <X size={15} />, onClick: () => onChange({ showIf: null }) }
            : {
                label: earlier.length ? "Show only if…" : "Show only if… (add a question above first)",
                icon: <GitBranch size={15} />,
                onClick: () => { if (earlier.length) onChange({ showIf: { questionId: earlier[earlier.length - 1].id, operator: "is", value: "" } }); },
              },
        ]} />
      </div>
    </div>
  );
}

function OptionsEditor({ type, options, onChange }: { type: QuestionType; options: string[]; onChange: (o: string[]) => void }) {
  const mark = type === "checkboxes" ? "rounded-[3px]" : "rounded-full";
  return (
    <div className="space-y-1">
      {options.map((o, i) => (
        <div key={i} className="group flex items-center gap-2.5">
          {type === "dropdown" ? <span className="w-4 text-sm text-zinc-400">{i + 1}.</span> : <span className={`h-4 w-4 shrink-0 border-2 border-zinc-300 ${mark}`} />}
          <input className={`${plainInput} border-b border-transparent py-1.5 text-sm text-zinc-800 hover:border-zinc-200 focus:border-indigo-400`}
            value={o} onChange={(e) => onChange(options.map((x, j) => (j === i ? e.target.value : x)))} />
          {options.length > 1 && (
            <button type="button" aria-label="Remove option" onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="rounded p-1 text-zinc-300 hover:text-red-600"><X size={15} /></button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...options, `Option ${options.length + 1}`])}
        className="flex items-center gap-2.5 py-1.5 text-sm text-zinc-500 hover:text-indigo-700">
        <Plus size={16} /> Add option
      </button>
    </div>
  );
}

function ConditionEditor({ c, earlier, onChange }: { c: Condition; earlier: Question[]; onChange: (c: Condition) => void }) {
  const source = earlier.find((q) => q.id === c.questionId);
  const sourceOptions = source?.type === "yes_no" ? ["Yes", "No"] : source && CHOICE_TYPES.includes(source.type) ? source.options : null;
  const set = (patch: Partial<Condition>) => onChange({ ...c, ...patch });
  const sel = "rounded-lg bg-white px-2.5 py-1.5 text-sm text-zinc-800 outline-none ring-1 ring-indigo-200 focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900">
      <GitBranch size={14} />
      <span>Show only if</span>
      <select className={`${sel} max-w-[220px]`} value={c.questionId} onChange={(e) => set({ questionId: e.target.value, value: "" })}>
        {earlier.map((q, i) => <option key={q.id} value={q.id}>{i + 1}. {q.title || "Untitled question"}</option>)}
      </select>
      <select className={sel} value={c.operator} onChange={(e) => set({ operator: e.target.value as Condition["operator"] })}>
        <option value="is">is</option>
        <option value="is_not">is not</option>
        <option value="contains">contains</option>
        <option value="answered">is answered</option>
      </select>
      {c.operator !== "answered" &&
        (sourceOptions ? (
          <select className={sel} value={c.value} onChange={(e) => set({ value: e.target.value })}>
            <option value="">Choose…</option>
            {sourceOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        ) : (
          <input className={`${sel} w-36`} value={c.value} placeholder="Answer" onChange={(e) => set({ value: e.target.value })} />
        ))}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: {
  label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      className={`rounded-lg p-2 hover:bg-zinc-100 disabled:opacity-30 ${danger ? "hover:text-red-600" : "hover:text-zinc-900"}`}>
      {children}
    </button>
  );
}

"use client";

import { Star } from "lucide-react";
import type { AnswerValue, Question } from "@/lib/types";

interface Props {
  question: Question;
  value: AnswerValue | undefined;
  error?: string | null;
  onChange: (v: AnswerValue) => void;
  autoFocus?: boolean;
}

export default function QuestionField({ question: q, value, error, onChange, autoFocus }: Props) {
  const inputId = `q-${q.id}`;
  return (
    <div>
      <label htmlFor={inputId} className="fr-q-title">
        {q.title || "Untitled question"}
        {q.required && <span className="fr-required">*</span>}
      </label>
      {q.description && <div className="fr-q-desc">{q.description}</div>}
      <div className="fr-field">
        <Input q={q} id={inputId} value={value} onChange={onChange} autoFocus={autoFocus} />
      </div>
      {error && <div className="fr-error">{error}</div>}
    </div>
  );
}

function Input({
  q,
  id,
  value,
  onChange,
  autoFocus,
}: {
  q: Question;
  id: string;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  autoFocus?: boolean;
}) {
  const str = typeof value === "string" || typeof value === "number" ? String(value) : "";

  switch (q.type) {
    case "long_text":
      return (
        <textarea id={id} className="fr-input" placeholder={q.placeholder || "Your answer"} value={str}
          autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} />
      );
    case "short_text":
    case "email":
    case "phone":
    case "number":
    case "date": {
      const type = { short_text: "text", email: "email", phone: "tel", number: "number", date: "date" }[q.type];
      const fallback = { short_text: "Your answer", email: "name@example.com", phone: "+1 555 000 0000", number: "0", date: "" }[q.type];
      return (
        <input id={id} type={type} className="fr-input" placeholder={q.placeholder || fallback} value={str}
          autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} />
      );
    }
    case "dropdown":
      return (
        <select id={id} className="fr-input" value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {q.options.map((o, i) => (
            <option key={i} value={o}>{o}</option>
          ))}
        </select>
      );
    case "multiple_choice":
    case "yes_no": {
      const options = q.type === "yes_no" ? ["Yes", "No"] : q.options;
      return (
        <div className={`fr-choices ${q.type === "yes_no" ? "fr-choices-row" : ""}`} role="radiogroup">
          {options.map((o, i) => (
            <label key={i} className="fr-choice" data-selected={str === o}>
              <input type="radio" name={id} checked={str === o} onChange={() => onChange(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      );
    }
    case "checkboxes": {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (o: string) =>
        onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
      return (
        <div className="fr-choices">
          {q.options.map((o, i) => (
            <label key={i} className="fr-choice" data-selected={selected.includes(o)}>
              <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      );
    }
    case "rating": {
      const n = typeof value === "number" ? value : Number(value) || 0;
      return (
        <div className="fr-stars" role="radiogroup" aria-label={q.title}>
          {Array.from({ length: q.max || 5 }, (_, i) => i + 1).map((s) => (
            <button key={s} type="button" className="fr-star" data-on={s <= n} aria-label={`${s} star${s > 1 ? "s" : ""}`}
              onClick={() => onChange(s === n ? null : s)}>
              <Star size={30} fill="currentColor" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      );
    }
  }
}

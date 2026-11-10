"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { AnswerValue, Answers, Form } from "@/lib/types";
import { backgroundStyle, themeStyle } from "@/lib/themes";
import { validate, visibleQuestions } from "@/lib/logic";
import { clearDraft, loadDraft, saveDraft } from "@/lib/store";
import QuestionField from "./QuestionField";
import FontLoader from "./FontLoader";

interface Props {
  form: Form;
  /** "preview" never saves anything; "live" keeps a draft and submits. */
  mode: "live" | "preview";
  onSubmit?: (answers: Answers) => Promise<void> | void;
  closedMessage?: string | null;
}

export default function FormRenderer({ form, mode, onSubmit, closedMessage }: Props) {
  const t = form.theme;
  // Restore saved progress. Pages only mount this after loading the form in the browser.
  const [answers, setAnswers] = useState<Answers>(() => (mode === "live" ? loadDraft(form.id) : {}));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "live" && !submitted) saveDraft(form.id, answers);
  }, [mode, form.id, answers, submitted]);

  const visible = useMemo(() => visibleQuestions(form.questions, answers), [form.questions, answers]);
  const oneAtATime = t.layout === "one";
  const current = Math.min(step, Math.max(visible.length - 1, 0));
  const isLast = current >= visible.length - 1;

  function setAnswer(id: string, v: AnswerValue) {
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id])
      setErrors((e) => {
        const rest = { ...e };
        delete rest[id];
        return rest;
      });
  }

  function check(ids: string[]): boolean {
    const next: Record<string, string> = {};
    for (const q of visible) {
      if (!ids.includes(q.id)) continue;
      const err = validate(q, answers[q.id]);
      if (err) next[q.id] = err;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!check(visible.map((q) => q.id))) {
      rootRef.current?.querySelector(".fr-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const clean: Answers = {};
    for (const q of visible) clean[q.id] = answers[q.id] ?? null;
    setBusy(true);
    setSubmitError(null);
    try {
      await onSubmit?.(clean);
      if (mode === "live") {
        clearDraft(form.id);
        if (/^https?:\/\//i.test(form.settings.redirectUrl)) {
          window.location.href = form.settings.redirectUrl;
          return;
        }
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    const q = visible[current];
    if (q && !check([q.id])) return;
    if (isLast) submit();
    else setStep(current + 1);
  }

  function reset() {
    setAnswers({});
    setErrors({});
    setStep(0);
    setSubmitted(false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!oneAtATime || e.key !== "Enter" || e.shiftKey) return;
    const el = e.target as HTMLElement;
    // Enter on a star should move on, not toggle the star off again.
    if (el.tagName === "TEXTAREA" || (el.tagName === "BUTTON" && !el.classList.contains("fr-star"))) return;
    e.preventDefault();
    next();
  }

  const btnClass = `fr-btn ${t.buttonStyle === "outline" ? "fr-btn-outline" : ""}`;
  const center = t.align === "center" ? "fr-center" : "";
  const card = `fr-card fr-card-${t.cardStyle ?? "shadow"}`;

  const header = (
    <div className={center}>
      {t.logo && <img src={t.logo} alt="" className="fr-logo" />}
      <h1 className="fr-title">{form.title || "Untitled form"}</h1>
      {form.description && <p className="fr-desc">{form.description}</p>}
    </div>
  );

  let body;
  if (closedMessage) {
    body = (
      <div className={card}>
        {header}
        <p className="fr-desc" style={{ marginTop: 24 }}>{closedMessage}</p>
      </div>
    );
  } else if (submitted) {
    body = (
      <div className={`${card} fr-center fr-step`}>
        <CheckCircle2 size={48} style={{ color: "var(--f-accent)", margin: "0 auto 16px" }} />
        <h2 className="fr-title" style={{ fontSize: "1.6em" }}>{form.settings.thankYouTitle || "Thank you!"}</h2>
        <p className="fr-desc">{form.settings.thankYouMessage}</p>
        {mode === "preview" && (
          <div className="fr-actions" style={{ justifyContent: "center" }}>
            <button type="button" className={btnClass} onClick={reset}>Start again</button>
          </div>
        )}
      </div>
    );
  } else if (oneAtATime) {
    const q = visible[current];
    body = (
      <div className={card}>
        {current === 0 && <div style={{ marginBottom: 32 }}>{header}</div>}
        <div className="fr-progress" aria-hidden>
          <div style={{ width: `${visible.length ? (current / visible.length) * 100 : 0}%` }} />
        </div>
        {q ? (
          <div key={q.id} className={`fr-step ${center}`}>
            <QuestionField question={q} value={answers[q.id]} error={errors[q.id]} autoFocus={mode === "live"}
              onChange={(v) => setAnswer(q.id, v)} />
          </div>
        ) : (
          <p className="fr-desc">This form has no questions yet.</p>
        )}
        <div className="fr-actions">
          {current > 0 && (
            <button type="button" className="fr-btn-ghost" onClick={() => setStep(current - 1)}>← Back</button>
          )}
          <button type="button" className={btnClass} onClick={next} disabled={busy}>
            {isLast ? form.settings.submitLabel || "Submit" : "Next"}
          </button>
          {q && q.type !== "long_text" && <span className="fr-hint">or press Enter ↵</span>}
        </div>
      </div>
    );
  } else {
    body = (
      <div className={card}>
        <div style={{ marginBottom: 36 }}>{header}</div>
        <div className="fr-questions">
          {visible.map((q) => (
            <QuestionField key={q.id} question={q} value={answers[q.id]} error={errors[q.id]}
              onChange={(v) => setAnswer(q.id, v)} />
          ))}
        </div>
        <div className="fr-actions">
          <button type="button" className={btnClass} onClick={submit} disabled={busy}>
            {form.settings.submitLabel || "Submit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="fr-root" style={themeStyle(t)} onKeyDown={onKeyDown}>
      <FontLoader fonts={[t.fonts.heading, t.fonts.body]} />
      <div className="fr-bg" style={backgroundStyle(t)} />
      {t.background.overlay > 0 && <div className="fr-overlay" style={{ opacity: t.background.overlay }} />}
      <div className="fr-content">
        {t.cover && <img src={t.cover} alt="" className="fr-cover" />}
        {body}
        {submitError && <div className="fr-error" role="alert" style={{ textAlign: "center" }}>{submitError}</div>}
        <div className="fr-footer">Made with <Link href="/">Formlane</Link></div>
      </div>
    </div>
  );
}

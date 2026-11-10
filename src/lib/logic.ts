import type { AnswerValue, Answers, Question, QuestionType } from "./types";

export const CHOICE_TYPES: QuestionType[] = ["multiple_choice", "checkboxes", "dropdown"];

export function isEmpty(v: AnswerValue | undefined): boolean {
  if (v === null || v === undefined) return true;
  if (Array.isArray(v)) return v.length === 0;
  return String(v).trim() === "";
}

export function answerText(v: AnswerValue | undefined): string {
  if (isEmpty(v)) return "";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

export function isVisible(q: Question, answers: Answers): boolean {
  const c = q.showIf;
  if (!c || !c.questionId) return true;
  const a = answers[c.questionId];
  const values = Array.isArray(a) ? a : isEmpty(a) ? [] : [String(a)];
  const target = c.value.trim().toLowerCase();
  const lower = values.map((v) => v.toLowerCase());
  switch (c.operator) {
    case "answered":
      return !isEmpty(a);
    case "is":
      return lower.includes(target);
    case "is_not":
      return !lower.includes(target);
    case "contains":
      return lower.some((v) => v.includes(target));
  }
}

export function visibleQuestions(questions: Question[], answers: Answers): Question[] {
  return questions.filter((q) => isVisible(q, answers));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(q: Question, v: AnswerValue | undefined): string | null {
  if (isEmpty(v)) return q.required ? "This question is required." : null;
  const s = String(v).trim();
  if (q.type === "email" && !EMAIL_RE.test(s)) return "Please enter a valid email address.";
  if (q.type === "number" && Number.isNaN(Number(s))) return "Please enter a number.";
  if (q.type === "phone" && !/^[+\d][\d\s\-()]{5,}$/.test(s)) return "Please enter a valid phone number.";
  return null;
}

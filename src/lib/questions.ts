import type { Question, QuestionType } from "./types";
import { uid } from "./id";

export const QUESTION_TYPES: { type: QuestionType; label: string; hint: string }[] = [
  { type: "short_text", label: "Short answer", hint: "One line of text" },
  { type: "long_text", label: "Paragraph", hint: "Longer text" },
  { type: "multiple_choice", label: "Multiple choice", hint: "Pick one" },
  { type: "checkboxes", label: "Checkboxes", hint: "Pick many" },
  { type: "dropdown", label: "Dropdown", hint: "Pick one from a list" },
  { type: "yes_no", label: "Yes / No", hint: "Simple choice" },
  { type: "rating", label: "Rating", hint: "Stars" },
  { type: "email", label: "Email", hint: "Checked automatically" },
  { type: "phone", label: "Phone", hint: "Phone number" },
  { type: "number", label: "Number", hint: "Numbers only" },
  { type: "date", label: "Date", hint: "Calendar picker" },
];

export function typeLabel(t: QuestionType): string {
  return QUESTION_TYPES.find((x) => x.type === t)?.label ?? t;
}

export function newQuestion(type: QuestionType, title = ""): Question {
  const needsOptions = type === "multiple_choice" || type === "checkboxes" || type === "dropdown";
  return {
    id: uid(),
    type,
    title: title || "Untitled question",
    description: "",
    required: false,
    placeholder: "",
    options: needsOptions ? ["Option 1", "Option 2"] : [],
    max: 5,
    showIf: null,
  };
}

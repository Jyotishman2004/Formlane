import type { Form, Question } from "./types";
import { newQuestion } from "./questions";
import { presetTheme } from "./themes";
import { uid } from "./id";

export const DEFAULT_SETTINGS: Form["settings"] = {
  acceptingResponses: true,
  closeAt: null,
  maxResponses: null,
  submitLabel: "Submit",
  thankYouTitle: "Thank you!",
  thankYouMessage: "Your response has been recorded.",
  redirectUrl: "",
};

function q(type: Question["type"], title: string, extra: Partial<Question> = {}): Question {
  return { ...newQuestion(type, title), ...extra };
}

function feedback(): Question[] {
  const used = q("yes_no", "Have you used our product before?", { required: true });
  return [
    q("short_text", "What's your name?", { placeholder: "Jane Doe" }),
    used,
    q("rating", "How would you rate your experience?", {
      required: true,
      showIf: { questionId: used.id, operator: "is", value: "Yes" },
    }),
    q("long_text", "What could we do better?", { placeholder: "Tell us anything…" }),
  ];
}

function registration(): Question[] {
  return [
    q("short_text", "Full name", { required: true }),
    q("email", "Email address", { required: true, placeholder: "you@example.com" }),
    q("phone", "Phone number"),
    q("multiple_choice", "Which session will you attend?", { required: true, options: ["Morning", "Afternoon", "Both"] }),
    q("checkboxes", "Dietary needs", { options: ["Vegetarian", "Vegan", "Gluten-free", "None"] }),
  ];
}

function contact(): Question[] {
  return [
    q("short_text", "Your name", { required: true }),
    q("email", "Email", { required: true }),
    q("dropdown", "Topic", { options: ["General question", "Support", "Sales", "Other"] }),
    q("long_text", "Message", { required: true }),
  ];
}

export const TEMPLATES = [
  { id: "blank", name: "Blank form", description: "Start from scratch", preset: "minimal", title: "Untitled form", build: (): Question[] => [] },
  { id: "feedback", name: "Feedback", description: "Ratings and comments", preset: "ocean", title: "Customer feedback", build: feedback },
  { id: "event", name: "Event registration", description: "Sign-ups and RSVPs", preset: "sunset", title: "Event registration", build: registration },
  { id: "contact", name: "Contact us", description: "Simple contact form", preset: "forest", title: "Get in touch", build: contact },
];

export function buildForm(templateId: string): Form {
  const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
  const now = new Date().toISOString();
  return {
    id: uid(8),
    title: t.title,
    description: t.id === "blank" ? "" : "It only takes a minute.",
    questions: t.build(),
    theme: presetTheme(t.preset),
    settings: { ...DEFAULT_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

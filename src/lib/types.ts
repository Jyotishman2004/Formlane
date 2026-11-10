export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "rating"
  | "date"
  | "yes_no";

export type ConditionOperator = "is" | "is_not" | "contains" | "answered";

export interface Condition {
  questionId: string;
  operator: ConditionOperator;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
  options: string[];
  max: number;
  showIf: Condition | null;
}

export interface Theme {
  preset: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    buttonText: string;
  };
  fonts: { heading: string; body: string };
  fontScale: number;
  radius: number;
  spacing: "compact" | "comfortable" | "airy";
  layout: "classic" | "one";
  align: "left" | "center";
  background: {
    type: "color" | "gradient" | "image";
    value: string;
    overlay: number;
  };
  /** How the box around the form looks. Older forms may not have it. */
  cardStyle?: "shadow" | "border" | "none";
  buttonShape: "square" | "rounded" | "pill";
  buttonStyle: "solid" | "outline";
  logo: string | null;
  cover: string | null;
}

export interface FormSettings {
  acceptingResponses: boolean;
  closeAt: string | null;
  maxResponses: number | null;
  submitLabel: string;
  thankYouTitle: string;
  thankYouMessage: string;
  redirectUrl: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  theme: Theme;
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export type AnswerValue = string | string[] | number | null;
export type Answers = Record<string, AnswerValue>;

export interface FormResponse {
  id: string;
  formId: string;
  answers: Answers;
  submittedAt: string;
}

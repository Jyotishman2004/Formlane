/**
 * Data access for forms and responses, stored in Supabase.
 *
 * Owners only ever see their own forms and responses (enforced by row level
 * security). Respondents read a form through get_public_form() and submit
 * through submit_response(), which refuses closed forms.
 */
import type { Answers, Form, FormResponse } from "./types";
import { buildForm } from "./templates";
import { uid } from "./id";
import { supabase } from "./supabase";

const DRAFT_PREFIX = "formlane:draft:";

interface FormRow {
  id: string;
  title: string;
  description: string;
  questions: Form["questions"];
  theme: Form["theme"];
  settings: Form["settings"];
  created_at: string;
  updated_at: string;
}

interface ResponseRow {
  id: string;
  form_id: string;
  answers: Answers;
  submitted_at: string;
}

const FORM_COLUMNS = "id, title, description, questions, theme, settings, created_at, updated_at";

function toForm(r: FormRow): Form {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    questions: r.questions,
    theme: r.theme,
    settings: r.settings,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toResponse(r: ResponseRow): FormResponse {
  return { id: r.id, formId: r.form_id, answers: r.answers, submittedAt: r.submitted_at };
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function listForms(): Promise<Form[]> {
  const { data, error } = await supabase.from("forms").select(FORM_COLUMNS).order("updated_at", { ascending: false });
  fail(error);
  return (data as FormRow[]).map(toForm);
}

export async function getForm(id: string): Promise<Form | null> {
  const { data, error } = await supabase.from("forms").select(FORM_COLUMNS).eq("id", id).maybeSingle();
  fail(error);
  return data ? toForm(data as FormRow) : null;
}

export async function saveForm(form: Form): Promise<Form> {
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("forms").upsert({
    id: form.id,
    title: form.title,
    description: form.description,
    questions: form.questions,
    theme: form.theme,
    settings: form.settings,
    created_at: form.createdAt,
    updated_at: updatedAt,
  });
  fail(error);
  return { ...form, updatedAt };
}

export async function createForm(templateId = "blank"): Promise<Form> {
  return saveForm(buildForm(templateId));
}

export async function duplicateForm(id: string): Promise<Form | null> {
  const form = await getForm(id);
  if (!form) return null;
  const now = new Date().toISOString();
  return saveForm({ ...structuredClone(form), id: uid(8), title: `${form.title} (copy)`, createdAt: now });
}

export async function deleteForm(id: string): Promise<void> {
  // Responses are removed with the form (on delete cascade).
  const { error } = await supabase.from("forms").delete().eq("id", id);
  fail(error);
}

export async function listResponses(formId: string): Promise<FormResponse[]> {
  const { data, error } = await supabase
    .from("responses")
    .select("id, form_id, answers, submitted_at")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });
  fail(error);
  return (data as ResponseRow[]).map(toResponse);
}

export async function countResponses(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("responses").select("form_id");
  fail(error);
  const counts: Record<string, number> = {};
  for (const r of data as { form_id: string }[]) counts[r.form_id] = (counts[r.form_id] ?? 0) + 1;
  return counts;
}

export async function deleteResponse(id: string): Promise<void> {
  const { error } = await supabase.from("responses").delete().eq("id", id);
  fail(error);
}

/** The form as respondents see it, plus why it's closed (null when open). */
export async function getPublicForm(id: string): Promise<{ form: Form; closedReason: string | null } | null> {
  const { data, error } = await supabase.rpc("get_public_form", { p_id: id });
  fail(error);
  if (!data) return null;
  const { closedReason, ...form } = data as Form & { closedReason: string | null };
  return { form, closedReason };
}

export async function addResponse(formId: string, answers: Answers): Promise<void> {
  const { error } = await supabase.rpc("submit_response", { p_form_id: formId, p_answers: answers });
  fail(error);
}

/** Respondent drafts stay in the respondent's browser so progress survives closing the tab. */
function readDraft(key: string): Answers {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

export function loadDraft(formId: string): Answers {
  return readDraft(DRAFT_PREFIX + formId);
}

export function saveDraft(formId: string, answers: Answers) {
  try {
    localStorage.setItem(DRAFT_PREFIX + formId, JSON.stringify(answers));
  } catch {}
}

export function clearDraft(formId: string) {
  try {
    localStorage.removeItem(DRAFT_PREFIX + formId);
  } catch {}
}

/** Why a form can't take responses right now, or null if it's open. Mirrors form_closed_reason() in the database. */
export function closedReason(form: Form, responseCount: number): string | null {
  const s = form.settings;
  if (!s.acceptingResponses) return "This form is no longer accepting responses.";
  if (s.closeAt && new Date(s.closeAt) < new Date()) return "This form closed on " + new Date(s.closeAt).toLocaleString() + ".";
  if (s.maxResponses && responseCount >= s.maxResponses) return "This form has reached its response limit.";
  return null;
}

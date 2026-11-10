"use client";

import type { FormSettings } from "@/lib/types";
import { Field, Section, Toggle, inputCls } from "./ui";

interface Props {
  settings: FormSettings;
  onChange: (s: FormSettings) => void;
}

/** datetime-local inputs want "YYYY-MM-DDTHH:mm" in local time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SettingsPanel({ settings: s, onChange }: Props) {
  const set = (patch: Partial<FormSettings>) => onChange({ ...s, ...patch });
  return (
    <div>
      <Section title="Responses">
        <Toggle label="Accepting responses" checked={s.acceptingResponses} onChange={(acceptingResponses) => set({ acceptingResponses })} />
        <Field label="Close automatically on" hint="Leave empty to keep the form open.">
          <input type="datetime-local" className={inputCls} value={toLocalInput(s.closeAt)}
            onChange={(e) => set({ closeAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </Field>
        <Field label="Maximum number of responses" hint="Leave empty for no limit.">
          <input type="number" min={1} className={inputCls} value={s.maxResponses ?? ""} placeholder="No limit"
            onChange={(e) => set({ maxResponses: e.target.value ? Math.max(1, Number(e.target.value)) : null })} />
        </Field>
      </Section>

      <Section title="Submit button">
        <Field label="Button text">
          <input className={inputCls} value={s.submitLabel} onChange={(e) => set({ submitLabel: e.target.value })} />
        </Field>
      </Section>

      <Section title="After submitting">
        <Field label="Thank-you title">
          <input className={inputCls} value={s.thankYouTitle} onChange={(e) => set({ thankYouTitle: e.target.value })} />
        </Field>
        <Field label="Thank-you message">
          <textarea className={`${inputCls} min-h-[64px]`} value={s.thankYouMessage} onChange={(e) => set({ thankYouMessage: e.target.value })} />
        </Field>
        <Field label="Or send people to a website" hint="Optional. Example: https://yoursite.com/thanks">
          <input className={inputCls} value={s.redirectUrl} placeholder="https://…" onChange={(e) => set({ redirectUrl: e.target.value })} />
        </Field>
      </Section>
    </div>
  );
}

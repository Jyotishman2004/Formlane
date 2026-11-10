"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Form } from "@/lib/types";
import { addResponse, getPublicForm } from "@/lib/store";
import FormRenderer from "@/components/FormRenderer";

export default function PublicFormPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null | undefined>(undefined);
  const [closed, setClosed] = useState<string | null>(null);

  useEffect(() => {
    getPublicForm(id)
      .then((res) => {
        if (res) {
          setClosed(res.closedReason);
          document.title = res.form.title || "Form";
        }
        setForm(res?.form ?? null);
      })
      .catch(() => setForm(null));
  }, [id]);

  if (form === undefined) return null;
  if (form === null)
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-zinc-900">This form doesn’t exist</p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">The link may be wrong, or the form was deleted.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ display: "grid" }}>
      <FormRenderer form={form} mode="live" closedMessage={closed}
        onSubmit={(answers) => addResponse(form.id, answers)} />
    </div>
  );
}

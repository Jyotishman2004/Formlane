"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Eye, Link2, Monitor, Palette, Settings, Smartphone, X } from "lucide-react";
import type { Form } from "@/lib/types";
import { getForm, saveForm } from "@/lib/store";
import FormRenderer from "@/components/FormRenderer";
import EditorHeader from "@/components/editor/EditorHeader";
import QuestionList from "@/components/editor/QuestionList";
import DesignPanel from "@/components/editor/DesignPanel";
import SettingsPanel from "@/components/editor/SettingsPanel";
import Panel from "@/components/Panel";
import { Segmented } from "@/components/editor/ui";

type Device = "desktop" | "mobile";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null | undefined>(undefined);
  const [designOpen, setDesignOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<"Saved" | "Saving…" | "Couldn’t save — check your connection">("Saved");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getForm(id).then(setForm);
  }, [id]);

  // Autosave shortly after each change.
  function update(next: Form) {
    setForm(next);
    setStatus("Saving…");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await saveForm(next);
        setStatus("Saved");
      } catch {
        setStatus("Couldn’t save — check your connection");
      }
    }, 400);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/f/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (form === undefined) return null;
  if (form === null)
    return (
      <div className="grid min-h-screen place-items-center text-center">
        <div>
          <p className="font-medium">Form not found.</p>
          <Link href="/" className="mt-2 inline-block text-sm text-indigo-600">Back to your forms</Link>
        </div>
      </div>
    );

  const toolBtn = (active: boolean) =>
    `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
      active ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  return (
    <div className="flex h-screen flex-col bg-zinc-100">
      <EditorHeader formId={id} title={form.title} active="edit" status={status} right={
        <>
          <button onClick={() => setDesignOpen(!designOpen)} className={toolBtn(designOpen)} title="Design">
            <Palette size={16} /> <span className="hidden lg:inline">Design</span>
          </button>
          <button onClick={() => setSettingsOpen(true)} className={toolBtn(false)} title="Settings">
            <Settings size={16} /> <span className="hidden lg:inline">Settings</span>
          </button>
          <button onClick={() => setPreviewOpen(true)} className={toolBtn(false)} title="Preview">
            <Eye size={16} /> <span className="hidden lg:inline">Preview</span>
          </button>
          <button onClick={copyLink}
            className="ml-1 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            {copied ? <Check size={15} /> : <Link2 size={15} />} {copied ? "Copied!" : "Share"}
          </button>
        </>
      } />

      <div className="flex min-h-0 flex-1">
        {designOpen ? (
          <>
            {/* While designing, the middle shows the real form so every change is visible. */}
            <main className="hidden min-w-0 flex-1 flex-col md:flex">
              <PreviewFrame form={form} device={device} onDevice={setDevice} />
            </main>
            <Panel title="Design" onClose={() => setDesignOpen(false)}>
              <DesignPanel theme={form.theme} onChange={(theme) => update({ ...form, theme })} />
            </Panel>
          </>
        ) : (
          <main className="min-w-0 flex-1 overflow-y-auto">
            <QuestionList form={form} onChange={update} />
          </main>
        )}
      </div>

      {settingsOpen && (
        <Panel variant="dialog" title="Settings" onClose={() => setSettingsOpen(false)}>
          <SettingsPanel settings={form.settings} onChange={(settings) => update({ ...form, settings })} />
        </Panel>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-zinc-100">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
            <span className="text-sm font-medium text-zinc-700">Preview — this is what people will see</span>
            <button onClick={() => setPreviewOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              <X size={16} /> Close
            </button>
          </div>
          <PreviewFrame form={form} device={device} onDevice={setDevice} />
        </div>
      )}
    </div>
  );
}

function PreviewFrame({ form, device, onDevice }: { form: Form; device: Device; onDevice: (d: Device) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex justify-center py-3">
        <div className="w-52">
          <Segmented value={device} onChange={onDevice}
            options={[{ value: "desktop", label: <><Monitor size={13} /> Desktop</> }, { value: "mobile", label: <><Smartphone size={13} /> Phone</> }]} />
        </div>
      </div>
      <div className="min-h-0 flex-1 px-4 pb-4">
        <div className={`mx-auto h-full overflow-y-auto bg-white shadow-xl ${
          device === "mobile" ? "max-w-[390px] rounded-[28px] border-[6px] border-zinc-800" : "max-w-5xl rounded-xl"
        }`}>
          <FormRenderer form={form} mode="preview" />
        </div>
      </div>
    </div>
  );
}

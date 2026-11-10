"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Copy, ExternalLink, LogOut, MoreVertical, Plus, Trash2 } from "lucide-react";
import Logo from "@/components/Logo";
import Menu from "@/components/Menu";
import AuthGate, { useUser } from "@/components/AuthGate";
import { supabase } from "@/lib/supabase";
import type { Form, Theme } from "@/lib/types";
import { countResponses, createForm, deleteForm, duplicateForm, listForms } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { presetTheme } from "@/lib/themes";

export default function Home() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

function Dashboard() {
  const user = useUser();
  const router = useRouter();
  const [forms, setForms] = useState<Form[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  async function refresh() {
    setForms(await listForms());
    setCounts(await countResponses());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create(templateId: string) {
    const form = await createForm(templateId);
    router.push(`/forms/${form.id}/edit`);
  }

  async function remove(form: Form) {
    if (!confirm(`Delete "${form.title}" and all its responses?`)) return;
    await deleteForm(form.id);
    refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-zinc-500 sm:inline">{user?.email}</span>
            <button onClick={() => supabase.auth.signOut()} title="Sign out"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900">Create a form</h1>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => create(t.id)} className="group w-40 shrink-0 text-left">
              <div className="overflow-hidden rounded-xl ring-1 ring-zinc-200 transition group-hover:ring-2 group-hover:ring-indigo-500">
                {t.id === "blank" ? (
                  <div className="grid aspect-[4/3] place-items-center bg-white">
                    <Plus size={32} className="text-indigo-600" />
                  </div>
                ) : (
                  <Thumb theme={presetTheme(t.preset)} />
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-800">{t.name}</div>
            </button>
          ))}
        </div>

        <h2 className="mt-12 text-lg font-semibold text-zinc-900">Your forms</h2>
        {forms === null ? null : forms.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nothing here yet. Pick an option above to make your first form.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {forms.map((f) => (
              <div key={f.id} className="group rounded-xl bg-white ring-1 ring-zinc-200 transition hover:shadow-md">
                <Link href={`/forms/${f.id}/edit`} className="block overflow-hidden rounded-t-xl">
                  <Thumb theme={f.theme} title={f.title} />
                </Link>
                <div className="flex items-start gap-1 py-2.5 pl-3 pr-1">
                  <Link href={`/forms/${f.id}/edit`} className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-900">{f.title || "Untitled form"}</div>
                    <div className="text-xs text-zinc-500">{counts[f.id] ?? 0} responses</div>
                  </Link>
                  <Menu label="Form options" trigger={<MoreVertical size={16} />} items={[
                    { label: "See responses", icon: <BarChart3 size={15} />, onClick: () => router.push(`/forms/${f.id}/responses`) },
                    { label: "Open form", icon: <ExternalLink size={15} />, onClick: () => window.open(`/f/${f.id}`, "_blank") },
                    { label: "Make a copy", icon: <Copy size={15} />, onClick: async () => { await duplicateForm(f.id); refresh(); } },
                    { label: "Delete", icon: <Trash2 size={15} />, onClick: () => remove(f), danger: true },
                  ]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/** A small picture of a form in its theme. */
function Thumb({ theme: t, title }: { theme: Theme; title?: string }) {
  const bg = t.background.type === "gradient" && t.background.value ? t.background.value : t.colors.background;
  return (
    <div className="flex aspect-[4/3] items-center justify-center p-4" style={{ background: bg }}>
      <div className="w-full rounded-md p-3 shadow-sm" style={{ background: t.colors.surface, borderRadius: Math.min(t.radius, 8) }}>
        {title ? (
          <div className="truncate text-[11px] font-semibold" style={{ color: t.colors.text }}>{title}</div>
        ) : (
          <div className="h-1.5 w-2/3 rounded" style={{ background: t.colors.text, opacity: 0.8 }} />
        )}
        <div className="mt-2 h-1.5 w-full rounded" style={{ background: t.colors.text, opacity: 0.12 }} />
        <div className="mt-1.5 h-1.5 w-4/5 rounded" style={{ background: t.colors.text, opacity: 0.12 }} />
        <div className="mt-2.5 h-2.5 w-10 rounded" style={{ background: t.colors.accent }} />
      </div>
    </div>
  );
}

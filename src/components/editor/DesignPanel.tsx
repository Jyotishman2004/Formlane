"use client";

import { useRef, type ChangeEvent } from "react";
import { AlertTriangle, AlignCenter, AlignLeft, ImagePlus, Layers, List, RotateCcw, X } from "lucide-react";
import type { Theme } from "@/lib/types";
import { FONTS, GRADIENTS, PRESETS, applyPreset, contrastRatio, presetTheme } from "@/lib/themes";
import FontLoader from "../FontLoader";
import { Collapsible, ColorInput, Field, Segmented, Slider, inputCls, readImage } from "./ui";

interface Props {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export default function DesignPanel({ theme: t, onChange }: Props) {
  const set = (patch: Partial<Theme>) => onChange({ ...t, ...patch });
  const setColor = (key: keyof Theme["colors"], v: string) => set({ colors: { ...t.colors, [key]: v } });
  const setBg = (patch: Partial<Theme["background"]>) => set({ background: { ...t.background, ...patch } });

  const textContrast = contrastRatio(t.colors.text, t.colors.surface);
  const buttonContrast = contrastRatio(t.colors.buttonText, t.colors.accent);

  return (
    <div>
      <FontLoader fonts={PRESETS.flatMap((p) => [p.theme.fonts.heading])} />

      <Collapsible title="Theme" defaultOpen summary={PRESETS.find((p) => p.id === t.preset)?.name}>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => {
            const active = t.preset === p.id;
            const bg = p.theme.background.type === "gradient" ? p.theme.background.value : p.theme.colors.background;
            return (
              <button key={p.id} type="button" onClick={() => onChange(applyPreset(t, p.id))} title={p.name}
                className={`rounded-xl p-0.5 text-left ring-2 transition ${active ? "ring-indigo-500" : "ring-transparent hover:ring-zinc-300"}`}>
                <div className="flex h-11 items-center justify-center rounded-lg px-2" style={{ background: bg }}>
                  <div className="flex w-full items-center gap-1.5 px-1.5 py-1" style={{ background: p.theme.colors.surface, borderRadius: Math.min(p.theme.radius, 6) }}>
                    <span className="text-xs font-bold" style={{ color: p.theme.colors.text, fontFamily: `"${p.theme.fonts.heading}"` }}>Aa</span>
                    <span className="h-1.5 flex-1 rounded-full" style={{ background: p.theme.colors.accent }} />
                  </div>
                </div>
                <div className="mt-1 truncate px-0.5 text-[11px] text-zinc-600">{p.name}</div>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => onChange(applyPreset(t, t.preset))}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800">
          <RotateCcw size={12} /> Reset to “{PRESETS.find((p) => p.id === t.preset)?.name ?? "theme"}” defaults
        </button>
      </Collapsible>

      <Collapsible title="Form box" defaultOpen>
        <Field label="Style">
          <Segmented value={t.cardStyle ?? "shadow"} onChange={(cardStyle) => set({ cardStyle })}
            options={[{ value: "shadow", label: "Shadow" }, { value: "border", label: "Outline" }, { value: "none", label: "No box" }]} />
        </Field>
        {(t.cardStyle ?? "shadow") !== "none" && (
          <ColorInput label="Box color" value={t.colors.surface} onChange={(v) => setColor("surface", v)} />
        )}
        <Slider label="Corner roundness" value={t.radius} min={0} max={28} format={(v) => `${v}px`} onChange={(radius) => set({ radius })} />
      </Collapsible>

      <Collapsible title="Logo & cover image">
        <ImageUpload label="Logo" value={t.logo} onChange={(logo) => set({ logo })} maxBytes={500_000} />
        <ImageUpload label="Cover image" value={t.cover} onChange={(cover) => set({ cover })} />
      </Collapsible>

      <Collapsible title="Colors">
        <div className="grid grid-cols-2 gap-2">
          <ColorInput label="Page background" value={t.colors.background} onChange={(v) => { setColor("background", v); }} />
          <ColorInput label="Text" value={t.colors.text} onChange={(v) => setColor("text", v)} />
          <ColorInput label="Secondary text" value={t.colors.muted} onChange={(v) => setColor("muted", v)} />
          <ColorInput label="Accent / button" value={t.colors.accent} onChange={(v) => setColor("accent", v)} />
          <ColorInput label="Button text" value={t.colors.buttonText} onChange={(v) => setColor("buttonText", v)} />
        </div>
        {(textContrast < 4.5 || buttonContrast < 3) && (
          <div className="flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              {textContrast < 4.5 ? "Text may be hard to read on the box color. " : ""}
              {buttonContrast < 3 ? "Button text may be hard to read on the accent color." : ""}
            </span>
          </div>
        )}
      </Collapsible>

      <Collapsible title="Background">
        <Segmented value={t.background.type} onChange={(type) => setBg({ type, value: type === "gradient" ? GRADIENTS[0] : type === "color" ? "" : t.background.type === "image" ? t.background.value : "" })}
          options={[{ value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }]} />
        {t.background.type === "color" && <p className="text-xs text-zinc-500">Uses the page background color above.</p>}
        {t.background.type === "gradient" && (
          <div className="grid grid-cols-6 gap-1.5">
            {GRADIENTS.map((g) => (
              <button key={g} type="button" aria-label="Use gradient" onClick={() => setBg({ value: g })}
                className={`h-9 rounded-lg border-2 ${t.background.value === g ? "border-indigo-500" : "border-white shadow-sm"}`} style={{ background: g }} />
            ))}
          </div>
        )}
        {t.background.type === "image" && (
          <>
            <ImageUpload label="Background image" value={t.background.value || null} onChange={(v) => setBg({ value: v ?? "" })} />
            <Field label="…or paste an image link">
              <input className={inputCls} placeholder="https://…" value={t.background.value.startsWith("data:") ? "" : t.background.value}
                onChange={(e) => setBg({ value: e.target.value })} />
            </Field>
          </>
        )}
        {t.background.type !== "color" && (
          <Slider label="Darken background" value={Math.round(t.background.overlay * 100)} min={0} max={80}
            format={(v) => `${v}%`} onChange={(v) => setBg({ overlay: v / 100 })} />
        )}
      </Collapsible>

      <Collapsible title="Fonts & text size">
        <FontLoader fonts={[t.fonts.heading, t.fonts.body]} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Heading font">
            <FontSelect value={t.fonts.heading} onChange={(heading) => set({ fonts: { ...t.fonts, heading } })} />
          </Field>
          <Field label="Body font">
            <FontSelect value={t.fonts.body} onChange={(body) => set({ fonts: { ...t.fonts, body } })} />
          </Field>
        </div>
        <Slider label="Text size" value={t.fontScale} min={0.85} max={1.25} step={0.05}
          format={(v) => `${Math.round(v * 100)}%`} onChange={(fontScale) => set({ fontScale })} />
      </Collapsible>

      <Collapsible title="Layout & spacing">
        <Field label="How questions appear">
          <Segmented value={t.layout} onChange={(layout) => set({ layout })}
            options={[{ value: "classic", label: <><List size={13} /> All at once</> }, { value: "one", label: <><Layers size={13} /> One at a time</> }]} />
        </Field>
        <Field label="Alignment">
          <Segmented value={t.align} onChange={(align) => set({ align })}
            options={[{ value: "left", label: <><AlignLeft size={13} /> Left</> }, { value: "center", label: <><AlignCenter size={13} /> Center</> }]} />
        </Field>
        <Field label="Spacing">
          <Segmented value={t.spacing} onChange={(spacing) => set({ spacing })}
            options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Normal" }, { value: "airy", label: "Airy" }]} />
        </Field>
      </Collapsible>

      <Collapsible title="Buttons">
        <Field label="Shape">
          <Segmented value={t.buttonShape} onChange={(buttonShape) => set({ buttonShape })}
            options={[{ value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }, { value: "pill", label: "Pill" }]} />
        </Field>
        <Field label="Style">
          <Segmented value={t.buttonStyle} onChange={(buttonStyle) => set({ buttonStyle })}
            options={[{ value: "solid", label: "Filled" }, { value: "outline", label: "Outline" }]} />
        </Field>
      </Collapsible>

      <div className="px-5 py-5">
        <button type="button" onClick={() => onChange(presetTheme("minimal"))}
          className="text-xs font-medium text-zinc-400 hover:text-red-600">Reset all design settings</button>
      </div>
    </div>
  );
}

function FontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} style={{ fontFamily: `"${value}"` }}>
      {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>
  );
}

function ImageUpload({ label, value, onChange, maxBytes }: {
  label: string; value: string | null; onChange: (v: string | null) => void; maxBytes?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onChange(await readImage(file, maxBytes));
    } catch (err) {
      alert((err as Error).message);
    }
  }
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-2">
          <img src={value} alt="" className="h-10 w-16 rounded object-contain" style={{ background: "repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 10px 10px" }} />
          <button type="button" onClick={() => ref.current?.click()} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Change</button>
          <span className="flex-1" />
          <button type="button" aria-label={`Remove ${label}`} onClick={() => onChange(null)} className="rounded p-1 text-zinc-400 hover:text-red-600">
            <X size={15} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 bg-white py-3 text-sm text-zinc-600 hover:border-indigo-400 hover:text-indigo-700">
          <ImagePlus size={16} /> Upload {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

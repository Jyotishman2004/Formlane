"use client";

import { useEffect } from "react";
import { googleFontsHref } from "@/lib/themes";

/** Loads the Google Fonts a form theme uses. */
export default function FontLoader({ fonts }: { fonts: string[] }) {
  const href = googleFontsHref(fonts);
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
  return null;
}

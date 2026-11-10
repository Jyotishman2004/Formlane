"use client";

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Logo from "./Logo";

const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);

/** Shows a sign-in screen until the person is logged in. */
export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return null;
  if (!user) return <SignIn />;
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setState("idle");
    } else {
      setState("sent");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-zinc-200">
          {state === "sent" ? (
            <div className="text-center">
              <Mail className="mx-auto text-indigo-600" size={36} />
              <h1 className="mt-3 text-lg font-semibold text-zinc-900">Check your email</h1>
              <p className="mt-1 text-sm text-zinc-500">
                We sent a sign-in link to <span className="font-medium text-zinc-800">{email}</span>. Open it on this device to continue.
              </p>
              <button onClick={() => setState("idle")} className="mt-5 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h1 className="text-lg font-semibold text-zinc-900">Sign in to Formlane</h1>
              <p className="mt-1 text-sm text-zinc-500">No password needed. We’ll email you a sign-in link.</p>
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="mt-5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={state === "sending"}
                className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {state === "sending" ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

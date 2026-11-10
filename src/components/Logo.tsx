import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">F</span>
      Formlane
    </Link>
  );
}

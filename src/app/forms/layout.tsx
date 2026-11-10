import AuthGate from "@/components/AuthGate";

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

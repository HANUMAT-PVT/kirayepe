import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Start renting smarter"
      subtitle="Create your free account to rent products or list your own."
    >
      <SignupForm />
    </AuthShell>
  );
}
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your rentals, listings and messages."
    >
      <LoginForm nextPath={nextPath} />
    </AuthShell>
  );
}
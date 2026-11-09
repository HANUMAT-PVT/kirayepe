import { requireUser } from "@/lib/auth";
import { PasswordForm } from "@/components/dashboard/password-form";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div>
      <div>
        <p className="section-eyebrow">Preferences</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Control notifications, security and your demo account.
        </p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <PasswordForm />
        <SettingsPanel email={user.email} role={user.role} />
      </div>
    </div>
  );
}
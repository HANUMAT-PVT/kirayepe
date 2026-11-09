import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        user={
          user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
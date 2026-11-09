import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f6f6fa] lg:grid lg:grid-cols-[240px_1fr]">
      <AdminSidebar name={admin.name} />
      <div className="min-w-0">
        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
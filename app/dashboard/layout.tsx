import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const unreadCount = await db.message.count({
    where: {
      readAt: null,
      senderId: { not: user.id },
      conversation: {
        is: { OR: [{ customerId: user.id }, { sellerId: user.id }] },
      },
    },
  });

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[250px_1fr]">
      <DashboardSidebar user={user} unreadCount={unreadCount} />
      <div className="min-w-0">
        <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
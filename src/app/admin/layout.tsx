import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/auth/signin?callbackUrl=/admin");
  if (session.user.role === "CUSTOMER") redirect("/");

  return (
    <div className="min-h-screen bg-brand-white">
      <AdminSidebar
        role={session.user.role}
        userEmail={session.user.email ?? ""}
      />
      <main className="md:pl-64 min-h-screen">
        <div className="px-6 py-8 md:px-10 md:py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Server-side gate for /dashboard/admin — Prisma role=admin only.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard/overview");
  }
  return <>{children}</>;
}

import type { Metadata } from "next";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}

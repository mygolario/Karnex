import type { Metadata } from "next";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";

/** Background Genesis roadmap chunks can take ~60–90s in parallel. */
export const maxDuration = 180;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}

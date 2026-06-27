"use client";

import dynamic from "next/dynamic";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { Loader2 } from "lucide-react";

const CopilotWorkspace = dynamic(
  () =>
    import("@/components/copilot/copilot-workspace").then((m) => m.CopilotWorkspace),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function CopilotPage() {
  return (
    <div className="relative">
      <div className="absolute top-2 start-2 z-20">
        <PageTourHelp tourId="copilot" />
      </div>
      <CopilotWorkspace />
    </div>
  );
}

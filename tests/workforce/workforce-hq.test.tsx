/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() } }));

vi.mock("@/contexts/project-context", () => ({
  useProject: () => ({
    loading: false,
    activeProject: {
      id: "p1",
      projectName: "فیت‌یار",
      projectType: "startup",
    },
  }),
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: (props: { checked?: boolean }) =>
    React.createElement("input", { type: "checkbox", checked: props.checked, readOnly: true }),
}));

import { WorkforceHq } from "@/components/dashboard/workforce/workforce-hq";

describe("workforce HQ UI", () => {
  it("renders named agents and night shift in Persian", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ runs: [], pendingCount: 0, nightShiftEnabled: false }),
      }),
    );

    render(React.createElement(WorkforceHq));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "میز عامل‌ها" })).toBeInTheDocument();
    });
    expect(screen.getByText("شب‌کاری کارنکس")).toBeInTheDocument();
    expect(screen.getByText("عامل تحقیق")).toBeInTheDocument();
    expect(screen.getByText("عامل اجرا")).toBeInTheDocument();
    expect(screen.getByText("عامل رشد")).toBeInTheDocument();
    expect(screen.getByText("عامل سرمایه")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /شروع شب‌کاری/ })).toBeInTheDocument();
    expect(screen.getByText("صندوق تأیید")).toBeInTheDocument();
  });
});

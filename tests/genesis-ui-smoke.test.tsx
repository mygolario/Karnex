/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ user: { id: "u1" }, loading: false }),
}));

vi.mock("@/contexts/project-context", () => ({
  useProject: () => ({ createNewProject: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) =>
    React.createElement("img", { alt: props.alt || "" }),
}));

import { GenesisWizardProvider } from "@/components/features/new-project/genesis-wizard-context";
import { GenesisWizardShell } from "@/components/features/new-project/genesis-wizard-shell";
import { StepWelcome } from "@/components/features/new-project/step-welcome";
import { StepPillar } from "@/components/features/new-project/step-pillar";

describe("genesis UI RTL smoke", () => {
  it("welcome renders Persian beginner CTA and path choices", () => {
    render(
      React.createElement(
        GenesisWizardProvider,
        null,
        React.createElement(
          GenesisWizardShell,
          null,
          React.createElement(StepWelcome)
        )
      )
    );
    expect(screen.getAllByText("کارنکس").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("مسیر کامل")).toBeTruthy();
    expect(screen.getByText("مسیر سریع")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /شروع گفت‌وگو با هم‌بنیان‌گذار/ })
    ).toBeTruthy();
    const rtlRoot = document.querySelector('[dir="rtl"]');
    expect(rtlRoot).toBeTruthy();
  });

  it("pillar shows coming-soon for traditional/creator", async () => {
    const { useGenesisWizard } = await import(
      "@/components/features/new-project/genesis-wizard-context"
    );
    function JumpToPillar() {
      const { goToStep } = useGenesisWizard();
      React.useEffect(() => {
        goToStep(1);
      }, [goToStep]);
      return React.createElement(StepPillar);
    }

    render(
      React.createElement(
        GenesisWizardProvider,
        null,
        React.createElement(
          GenesisWizardShell,
          null,
          React.createElement(JumpToPillar)
        )
      )
    );

    expect(screen.getByText("چه چیزی می‌سازی؟")).toBeTruthy();
    const soon = screen.getAllByText("به‌زودی");
    expect(soon.length).toBeGreaterThanOrEqual(2);
  });
});

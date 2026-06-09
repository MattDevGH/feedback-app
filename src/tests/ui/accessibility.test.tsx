import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Home from "@/app/page";
import FeedbackForm from "@/app/feedback/[token]/FeedbackForm";

expect.extend(toHaveNoViolations);

// Note: axe in jsdom cannot evaluate colour contrast — verify manually
// with the axe DevTools browser extension or Lighthouse.

describe("Accessibility", () => {
  it("landing page has no axe-detectable violations", async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("feedback form has no axe-detectable violations", async () => {
    const { container } = render(<FeedbackForm token="a11y-test-token" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackForm from "@/app/feedback/[token]/FeedbackForm";
import LandingPage from "@/app/page";

// Helper: expand and fill one question from each required section
async function fillOncePerSection(user: ReturnType<typeof userEvent.setup>) {
  // Expand and answer one Continue question
  await user.click(screen.getByText(/what are some things matt does well/i));
  await user.type(screen.getByPlaceholderText(/clear communicator/i), "Great communicator");

  // Expand and answer one Stop question
  await user.click(screen.getByText(/what does matt struggle with/i));
  await user.type(screen.getByPlaceholderText(/tends to take on too much/i), "Slow to decide");

  // Expand and answer one Start question
  await user.click(screen.getByText(/what skills or behaviours should matt build on/i));
  await user.type(screen.getByPlaceholderText(/stakeholder management/i), "More public speaking");
}

describe("Landing page", () => {
  it("shows the request form", () => {
    render(<LandingPage />);
    expect(screen.getByLabelText(/your name or identifier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brief message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request to give feedback/i })).toBeInTheDocument();
  });
});

describe("Feedback form", () => {
  it("renders section headings for each category", () => {
    render(<FeedbackForm token="test-token-123" />);
    expect(screen.getAllByText("Continue").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Stop").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Start").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("General").length).toBeGreaterThanOrEqual(1);
  });

  it("shows questions as collapsed items", () => {
    render(<FeedbackForm token="test-token-123" />);
    // Questions visible as buttons but textareas not shown
    expect(screen.getByText(/what are some things matt does well/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/clear communicator/i)).not.toBeInTheDocument();
  });

  it("expands a question when clicked", async () => {
    const user = userEvent.setup();
    render(<FeedbackForm token="test-token-123" />);

    await user.click(screen.getByText(/what are some things matt does well/i));
    expect(screen.getByPlaceholderText(/clear communicator/i)).toBeInTheDocument();
  });

  it("submit button is disabled when form is empty", () => {
    render(<FeedbackForm token="test-token-123" />);
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeDisabled();
  });

  it("submit button enables once one question per section is answered", async () => {
    const user = userEvent.setup();
    render(<FeedbackForm token="test-token-123" />);
    await fillOncePerSection(user);
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeEnabled();
  });

  it("shows thank-you message after successful submission", async () => {
    const user = userEvent.setup();
    render(<FeedbackForm token="test-token-123" />);
    await fillOncePerSection(user);
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /thank you/i })).toBeInTheDocument();
    });
  });

  it("shows error message when submission fails", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");

    server.use(
      http.post("/api/feedback", () =>
        HttpResponse.json({ error: "Submission failed." }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    render(<FeedbackForm token="test-token-123" />);
    await fillOncePerSection(user);
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("section completion indicators update as questions are filled", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    render(<FeedbackForm token="fresh-token-no-draft" />);

    expect(screen.getByLabelText(/continue: incomplete/i)).toBeInTheDocument();

    await user.click(screen.getByText(/what are some things matt does well/i));
    await user.type(screen.getByPlaceholderText(/clear communicator/i), "Great communicator");

    await waitFor(() => {
      expect(screen.getByLabelText(/continue: complete/i)).toBeInTheDocument();
    });
  });
});

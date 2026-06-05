import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// Helper: fill all mandatory questions to make the form submittable
async function fillMandatoryQuestions(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/what does this person do well/i), "Great communicator");
  await user.type(
    screen.getByLabelText(/what does this person struggle with/i),
    "Slow to make decisions",
  );
  await user.type(
    screen.getByLabelText(/what should this person start doing or do more of/i),
    "Seek feedback more regularly",
  );
}

describe("Feedback form", () => {
  it("renders all nine questions", () => {
    render(<Home />);
    // Continue (praise)
    expect(screen.getByLabelText(/what does this person do well/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/describe a specific example/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what should this person continue doing/i)).toBeInTheDocument();
    // Stop (criticism)
    expect(screen.getByLabelText(/what does this person struggle with/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/handled things better/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stop doing or do less of/i)).toBeInTheDocument();
    // Start (suggestion)
    expect(
      screen.getByLabelText(/what should this person start doing or do more of/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/skill or behaviour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what should this person start doing\?/i)).toBeInTheDocument();
  });

  it("submit button is disabled when form is empty", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeDisabled();
  });

  it("submit button remains disabled when only some mandatory questions are answered", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText(/what does this person do well/i), "Good listener");
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeDisabled();
  });

  it("submit button enables once all mandatory questions are answered", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await fillMandatoryQuestions(user);
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeEnabled();
  });

  it("shows thank-you message after successful submission", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await fillMandatoryQuestions(user);
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
        HttpResponse.json({ error: "Submission failed. Please try again." }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    render(<Home />);
    await fillMandatoryQuestions(user);
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("section completion indicators update as questions are filled", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Initially all sections show "Continue: incomplete"
    expect(screen.getByLabelText(/continue: incomplete/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/what does this person do well/i), "Great communicator");

    await waitFor(() => {
      expect(screen.getByLabelText(/continue: complete/i)).toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

describe("Feedback form", () => {
  it("renders the form with both question labels", () => {
    render(<Home />);
    expect(
      screen.getByLabelText(/what does this person do well/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/what could this person do to improve/i)
    ).toBeInTheDocument();
  });

  it("submit button is disabled when fields are empty", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeDisabled();
  });

  it("submit button enables once both fields have content", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(
      screen.getByLabelText(/what does this person do well/i),
      "Good listener"
    );
    await user.type(
      screen.getByLabelText(/what could this person do to improve/i),
      "More proactive"
    );

    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeEnabled();
  });

  it("shows thank-you message after successful submission", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(
      screen.getByLabelText(/what does this person do well/i),
      "Great communicator"
    );
    await user.type(
      screen.getByLabelText(/what could this person do to improve/i),
      "Could delegate more"
    );
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
        HttpResponse.json({ error: "Submission failed. Please try again." }, { status: 500 })
      )
    );

    const user = userEvent.setup();
    render(<Home />);

    await user.type(
      screen.getByLabelText(/what does this person do well/i),
      "Good listener"
    );
    await user.type(
      screen.getByLabelText(/what could this person do to improve/i),
      "Needs improvement"
    );
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows error when a field exceeds the 2000 character limit", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");

    server.use(
      http.post("/api/feedback", () =>
        HttpResponse.json(
          { error: "Each field must be 2000 characters or fewer." },
          { status: 400 }
        )
      )
    );

    const user = userEvent.setup();
    render(<Home />);

    // Paste a 2001-character string to bypass the client-side character count
    const overlong = "a".repeat(2001);
    await user.click(screen.getByLabelText(/what does this person do well/i));
    await user.paste(overlong);
    await user.type(
      screen.getByLabelText(/what could this person do to improve/i),
      "Normal length"
    );
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/2000 characters/i);
    });
  });
});

import { getFeedbackRepository } from "@/lib/repositories";

// Force dynamic rendering so feedback is always fresh
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const repo = getFeedbackRepository();
  const feedback = await repo.findAll();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Feedback</h1>
        <p className="text-sm text-gray-500 mb-8">
          {feedback.length === 0
            ? "No feedback yet."
            : `${feedback.length} response${feedback.length === 1 ? "" : "s"}`}
        </p>

        {feedback.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Feedback submitted via the form will appear here.
          </div>
        ) : (
          <ul className="space-y-4">
            {feedback.map((item) => (
              <li key={item.id} className="bg-white rounded-2xl shadow-sm p-6">
                <time
                  dateTime={item.submittedAt.toISOString()}
                  className="text-xs text-gray-400 block mb-4"
                >
                  {item.submittedAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>

                <div className="mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">
                    What I do well
                  </h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.strengths}</p>
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">
                    What I could improve
                  </h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.improvements}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

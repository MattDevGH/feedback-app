import { getFeedbackRepository, getTokenRepository } from "@/lib/repositories";
import { QUESTIONS, CATEGORY_CONFIG, type Category } from "@/lib/questions.config";
import TokenPanel from "./TokenPanel";

export const dynamic = "force-dynamic";

const questionMap = Object.fromEntries(QUESTIONS.map((q) => [q.key, q]));

type Props = { searchParams: Promise<{ key?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const [feedbackRepo, tokenRepo] = [getFeedbackRepository(), getTokenRepository()];
  const [submissions, tokens] = await Promise.all([feedbackRepo.findAll(), tokenRepo.findAll()]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Admin</h1>

        {/* Token management */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Invite Links</h2>
          <TokenPanel tokens={tokens} adminKey={key ?? ""} />
        </section>

        {/* Feedback submissions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Feedback</h2>
          <p className="text-sm text-gray-500 mb-6">
            {submissions.length === 0
              ? "No feedback yet."
              : `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`}
          </p>

          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
              Feedback submitted via the form will appear here.
            </div>
          ) : (
            <ul className="space-y-6">
              {submissions.map((submission) => (
                <li key={submission.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-baseline justify-between mb-5">
                    <time
                      dateTime={submission.submittedAt.toISOString()}
                      className="text-xs text-gray-400"
                    >
                      {submission.submittedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    {submission.reviewerName && (
                      <span className="text-xs font-medium text-gray-500">
                        {submission.reviewerName}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-4">
                    {submission.responses.map((response) => {
                      const question = questionMap[response.questionKey];
                      // Fallback to "praise" styling if the question was deleted from config
                      const category = (question?.category ?? "praise") as Category;
                      const categoryStyle = CATEGORY_CONFIG[category];
                      return (
                        <li
                          key={response.id}
                          className={`border-l-4 ${categoryStyle.borderColor} pl-4`}
                        >
                          <p
                            className={`text-xs font-semibold uppercase tracking-wide mb-1 ${categoryStyle.color}`}
                          >
                            {categoryStyle.label}
                          </p>
                          <p className="text-xs text-gray-400 mb-1">
                            {question?.text ?? response.questionKey}
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {response.value}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

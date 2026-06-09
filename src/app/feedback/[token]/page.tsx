import { getFeedbackRepository, getTokenRepository } from "@/lib/repositories";
import { QUESTIONS, CATEGORY_CONFIG, type Category } from "@/lib/questions.config";
import { notFound } from "next/navigation";
import FeedbackForm from "./FeedbackForm";

export const dynamic = "force-dynamic";

const questionMap = Object.fromEntries(QUESTIONS.map((q) => [q.key, q]));

type Props = { params: Promise<{ token: string }> };

export default async function ReviewPage({ params }: Props) {
  const { token } = await params;
  const tokenRepo = getTokenRepository();
  const reviewToken = await tokenRepo.findByToken(token);

  if (!reviewToken) {
    notFound();
  }

  if (reviewToken.status === "requested") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            ⏳
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Being considered</h1>
          <p className="text-gray-500">
            Your offer to give feedback is still being reviewed. Please check back later.
          </p>
        </div>
      </main>
    );
  }

  if (reviewToken.status === "anonymous") {
    return <AnonymousConfirmation usedAt={reviewToken.usedAt!} />;
  }

  if (reviewToken.status === "submitted" && reviewToken.submissionId) {
    const feedbackRepo = getFeedbackRepository();
    const submissions = await feedbackRepo.findAll();
    const submission = submissions.find((s) => s.id === reviewToken.submissionId);

    if (submission) {
      return <SubmittedView submission={submission} />;
    }
  }

  if (reviewToken.expiresAt && new Date() > reviewToken.expiresAt) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            ⏰
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Link expired</h1>
          <p className="text-gray-500">
            This feedback link is no longer active. Please request a new one.
          </p>
        </div>
      </main>
    );
  }

  return <FeedbackForm token={token} />;
}

function AnonymousConfirmation({ usedAt }: { usedAt: Date }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          🔒
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Submitted anonymously</h1>
        <p className="text-gray-500 mb-2">
          Your feedback was submitted anonymously on{" "}
          {usedAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          .
        </p>
        <p className="text-xs text-gray-400">
          Your responses are not stored in the app. Refer to your sent email for a copy.
        </p>
      </div>
    </main>
  );
}

function SubmittedView({
  submission,
}: {
  submission: {
    submittedAt: Date;
    responses: { id: string; questionKey: string; value: string }[];
  };
}) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
          <div className="text-4xl mb-3" aria-hidden="true">
            ✅
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Feedback submitted</h1>
          <p className="text-sm text-gray-500">
            Submitted on{" "}
            {submission.submittedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <ul className="space-y-4">
          {submission.responses.map((response) => {
            const question = questionMap[response.questionKey];
            const category = (question?.category ?? "praise") as Category;
            const categoryStyle = CATEGORY_CONFIG[category];
            return (
              <li
                key={response.id}
                className={`bg-white rounded-xl border-l-4 ${categoryStyle.borderColor} shadow-sm p-5`}
              >
                <p className="text-xs text-gray-400 mb-1">
                  {question?.text ?? response.questionKey}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.value}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

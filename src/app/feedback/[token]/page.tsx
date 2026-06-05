import { getTokenRepository } from "@/lib/repositories";
import { notFound } from "next/navigation";
import FeedbackForm from "./FeedbackForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function ReviewPage({ params }: Props) {
  const { token } = await params;
  const tokenRepo = getTokenRepository();
  const reviewToken = await tokenRepo.findByToken(token);

  if (!reviewToken) {
    notFound();
  }

  if (reviewToken.submissionId) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            ✅
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Already submitted</h1>
          <p className="text-gray-500">
            Feedback has already been submitted using this link. Thank you!
          </p>
        </div>
      </main>
    );
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

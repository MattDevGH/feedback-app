"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Unable to load feedback</h1>
        <p className="text-sm text-gray-500 mb-6">
          There was a problem connecting to the database. Please try again shortly.
        </p>
        <button
          onClick={reset}
          className="text-sm text-indigo-600 hover:underline focus:outline-none"
        >
          Retry
        </button>
      </div>
    </main>
  );
}

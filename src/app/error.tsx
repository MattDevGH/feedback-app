"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="text-sm text-indigo-600 hover:underline focus:outline-none"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

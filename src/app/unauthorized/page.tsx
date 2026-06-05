export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          🔒
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Access denied</h1>
        <p className="text-sm text-gray-500">You need a valid admin link to view this page.</p>
      </div>
    </main>
  );
}

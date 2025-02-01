export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-start justify-center pt-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-8"></div>
        <h2 className="text-2xl font-semibold text-white">Loading...</h2>
        <p className="text-gray-400 mt-2">Please wait while we fetch the data</p>
      </div>
    </main>
  );
} 
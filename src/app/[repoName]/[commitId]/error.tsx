'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CommitError() {
  const params = useParams();
  const repoName = params?.repoName as string;

  return (
    <main className="min-h-screen bg-gray-900 flex items-start justify-center px-4 pt-32">
      <div className="text-center">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Invalid Commit</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          This commit doesn't exist or the build artifact has expired. Please check the commit hash and try again.
        </p>
        <div className="space-x-4">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Plugins
          </Link>
          <Link 
            href={`/${repoName}`}
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Plugin
          </Link>
        </div>
      </div>
    </main>
  );
} 
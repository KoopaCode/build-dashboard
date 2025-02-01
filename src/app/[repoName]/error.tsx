'use client';

import Link from 'next/link';

export default function PluginError() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-start justify-center px-4 pt-32">
      <div className="text-center">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Invalid Plugin</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          This plugin doesn't exist or hasn't been built yet. Please check the plugin name and try again.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          View All Plugins
        </Link>
      </div>
    </main>
  );
} 
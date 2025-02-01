import { fetchPluginData } from '@/utils/github';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateMetadata as createMetadata } from '@/utils/metadata';

export default async function RepoPage({ params }: { params: { repoName: string } }) {
  try {
    const plugin = await fetchPluginData(params.repoName);
    
    if (!plugin || !plugin.artifacts.length) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to all plugins</span>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              {plugin.name}
            </h1>
            <p className="text-xl text-gray-400">
              {plugin.description}
            </p>
          </div>

          <div className="space-y-6">
            {plugin.artifacts.map((artifact, index) => (
              <div 
                key={index}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Build: {artifact.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      Created at: {new Date(artifact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/${params.repoName}/${artifact.workflowRun.headSha}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View Details
                  </Link>
                </div>

                {artifact.commitInfo && (
                  <div className="mt-4 bg-gray-900 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Commit Message</h3>
                    <p className="text-gray-400 whitespace-pre-wrap">
                      {artifact.commitInfo.message}
                    </p>
                    <div className="mt-4 flex space-x-6 text-sm">
                      <span className="text-green-500">
                        +{artifact.commitInfo.stats.additions} additions
                      </span>
                      <span className="text-red-500">
                        -{artifact.commitInfo.stats.deletions} deletions
                      </span>
                      <span className="text-blue-500">
                        {artifact.commitInfo.stats.total} total changes
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <a
                    href={artifact.downloadUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Build
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: { params: { repoName: string } }) {
  const plugin = await fetchPluginData(params.repoName);
  
  return createMetadata({
    title: `${plugin.name} - KoopaLabs Builds`,
    description: plugin.description || `Latest builds for ${plugin.name}`,
    path: `/${params.repoName}`,
  });
} 
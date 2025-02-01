import { fetchPluginData, fetchCommitDetails } from '@/utils/github';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateMetadata as createMetadata } from '@/utils/metadata';
import CreateIssueButton from '@/app/components/CreateIssueButton';

interface CommitFile {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
}

export default async function CommitPage({ 
  params 
}: { 
  params: { repoName: string; commitId: string } 
}) {
  try {
    const plugin = await fetchPluginData(params.repoName);
    const commit = await fetchCommitDetails(params.repoName, params.commitId);
    
    if (!plugin || !commit) {
      notFound();
    }

    const artifact = plugin.artifacts.find(
      a => a.workflowRun.headSha === params.commitId
    );

    if (!artifact) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to all plugins</span>
            </Link>
            <Link 
              href={`/${params.repoName}`}
              className="text-gray-400 hover:text-white flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to {plugin.name}</span>
            </Link>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {plugin.name} - Commit {params.commitId}
              </h1>
              <p className="text-gray-400">
                Build: {artifact.name}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h2 className="text-white font-medium mb-2">Commit Message</h2>
                <p className="text-gray-400 whitespace-pre-wrap">
                  {commit.message}
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <h2 className="text-white font-medium mb-4">Changes</h2>
                <div className="space-y-2">
                  {commit.files.map((file: CommitFile, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="font-mono text-gray-400">{file.filename}</span>
                      <div className="flex space-x-4">
                        <span className="text-green-500">+{file.additions}</span>
                        <span className="text-red-500">-{file.deletions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <a
                  href={artifact.downloadUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Build
                </a>
                
                <CreateIssueButton
                  repoName={params.repoName}
                  artifactName={artifact.name}
                  commitId={params.commitId}
                  createdAt={artifact.createdAt}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: { repoName: string; commitId: string } 
}) {
  const plugin = await fetchPluginData(params.repoName);
  const commit = await fetchCommitDetails(params.repoName, params.commitId);
  
  return createMetadata({
    title: `${plugin.name} - Commit ${params.commitId.substring(0, 7)}`,
    description: commit?.message || `Build details for commit ${params.commitId.substring(0, 7)}`,
    path: `/${params.repoName}/${params.commitId}`,
  });
} 
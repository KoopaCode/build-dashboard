'use client';
import { useState } from 'react';
import { Plugin } from '@/types/github';
import Link from 'next/link';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface SelectedBuildInfo {
  plugin: Plugin;
  artifactIndex: number;
}

interface ModifiedFile {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
  blob_url?: string;
}

// Move fetchUpdatedPlugins function before it's used
const fetchUpdatedPlugins = async () => {
  try {
    const response = await fetch('/api/plugins');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching updated plugins:', error);
    return [];
  }
};

export default function ClientSearch({ initialPlugins }: { initialPlugins: Plugin[] }) {
  const { data: plugins, lastUpdated } = useAutoRefresh(initialPlugins, fetchUpdatedPlugins);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuild, setSelectedBuild] = useState<SelectedBuildInfo | null>(null);

  const filteredPlugins = searchTerm
    ? plugins.filter(plugin => 
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : plugins;

  const openIssueTemplate = (plugin: Plugin) => {
    const template = encodeURIComponent(`**Description of the issue:**
[Describe your issue here]

**Steps to reproduce:**
1. 
2. 
3. 

**Expected behavior:**
[What did you expect to happen?]

**Actual behavior:**
[What actually happened?]

**Plugin version:**
[Version of the plugin you're using]

**Server version:**
[Your server software and version (e.g., Paper 1.19.2)]

**Additional context:**
[Any other relevant information]`);

    window.open(`https://github.com/KoopaCode/${plugin.repoName}/issues/new?body=${template}`, '_blank');
  };

  function CommitFileChanges({ file, repoName, commitSha }: { 
    file: ModifiedFile; 
    repoName: string;
    commitSha: string;
  }) {
    const filenameParts = file.filename.split('.');
    const extension = filenameParts.length > 1 ? filenameParts.pop() : '';
    const name = filenameParts.join('.');

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'added': return 'text-green-400';
        case 'modified': return 'text-yellow-400';
        case 'removed': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    // Generate GitHub URLs
    const fileUrl = `https://github.com/KoopaCode/${repoName}/blob/${commitSha}/${file.filename}`;
    const diffUrl = `https://github.com/KoopaCode/${repoName}/commit/${commitSha}#diff-${Buffer.from(file.filename).toString('hex')}`;

    return (
      <div className="flex items-center justify-between py-2 text-sm bg-gray-800 rounded-lg px-4 hover:bg-gray-700 transition-colors">
        <div className="flex-1 truncate flex items-center space-x-2">
          <span className={`${getStatusColor(file.status)} text-xs uppercase`}>
            {file.status}
          </span>
          <a 
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-gray-300 hover:text-blue-400 transition-colors"
          >
            {name}
            {extension && <span className="text-gray-500">.{extension}</span>}
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4">
            {file.additions > 0 && (
              <span className="text-green-500 flex items-center">
                <span className="text-xs mr-1">+</span>{file.additions}
              </span>
            )}
            {file.deletions > 0 && (
              <span className="text-red-500 flex items-center">
                <span className="text-xs mr-1">-</span>{file.deletions}
              </span>
            )}
          </div>
          <a
            href={diffUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
            title="View changes"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="mb-8 px-4 sm:px-0">
        <div className="relative">
          <input
            type="search"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-4 top-3 text-gray-400 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 sm:px-0">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.repoName}
            className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all group"
          >
            <div className="p-4 md:p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/${plugin.repoName}`}
                    className="group-hover:text-blue-400 transition-colors block"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 hover:text-blue-400 transition-colors truncate">
                      {plugin.name}
                    </h2>
                  </Link>
                  <p className="text-gray-400 text-sm md:text-base line-clamp-2">{plugin.description}</p>
                </div>
                <div className="flex space-x-3 sm:flex-shrink-0">
                  <button
                    onClick={() => openIssueTemplate(plugin)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Report Issue"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </button>
                  <Link
                    href={`/${plugin.repoName}`}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    title="View Plugin Details"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Artifacts Section */}
              <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
                {plugin.artifacts.length > 0 ? (
                  plugin.artifacts.map((artifact, index) => (
                    <div 
                      key={`${plugin.repoName}-${artifact.name}-${artifact.createdAt}`}
                      className="bg-gray-700 rounded-lg p-3 md:p-4 hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-medium flex items-center text-sm md:text-base">
                            <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mr-2 ${
                              artifact.workflowRun.conclusion === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></span>
                            <span className="truncate">{artifact.name}</span>
                          </h3>
                          <div className="text-xs md:text-sm text-gray-400 mt-1">
                            <p>Built: {new Date(artifact.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                          <button
                            onClick={() => setSelectedBuild({ plugin, artifactIndex: index })}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors flex items-center justify-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Info</span>
                          </button>
                          <a
                            href={artifact.downloadUrl}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-700 rounded-lg">
                    <svg className="w-12 h-12 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-400">No builds available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Build Info Modal */}
      {selectedBuild && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedBuild.plugin.name}</h2>
                  <p className="text-gray-400">
                    Build: {selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBuild(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Build Information */}
              <div className="space-y-6">
                {/* Build Status */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Build Status</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].workflowRun.conclusion === 'success' 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}></span>
                    <span className="text-gray-300">
                      {selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].workflowRun.conclusion === 'success' 
                        ? 'Build Successful' 
                        : 'Build In Progress'}
                    </span>
                  </div>
                </div>

                {/* Build Details */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Build Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Created: </span>
                      {new Date(selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].createdAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-gray-400">Size: </span>
                      {Math.round(selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].size / 1024)} KB
                    </p>
                    <p>
                      <span className="text-gray-400">Commit: </span>
                      <code className="bg-gray-800 px-2 py-0.5 rounded text-sm">
                        {selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].workflowRun.headSha.substring(0, 7)}
                      </code>
                    </p>
                  </div>
                </div>

                {/* Commit Information */}
                {selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].commitInfo && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Commit Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-gray-400 text-sm mb-1">Message</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].commitInfo.message}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-sm mb-1">Changes</h4>
                        <div className="flex space-x-6 text-sm">
                          <span className="text-green-400">
                            +{selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].commitInfo.stats.additions} additions
                          </span>
                          <span className="text-red-400">
                            -{selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].commitInfo.stats.deletions} deletions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <Link
                    href={`/${selectedBuild.plugin.repoName}/${selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].workflowRun.headSha}`}
                    className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                  >
                    <span>View Full Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <a
                    href={selectedBuild.plugin.artifacts[selectedBuild.artifactIndex].downloadUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Build</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
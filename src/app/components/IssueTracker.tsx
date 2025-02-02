'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Add language support
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';

// Register languages
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('java', java);

interface Issue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  body: string;
  labels: {
    name: string;
    color: string;
  }[];
  user: {
    login: string;
    avatar_url: string;
  };
}

interface IssueTrackerProps {
  repoName: string;
  buildVersion: string;
  commitId: string;
}

interface MarkdownComponentProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function IssueTracker({ repoName, buildVersion, commitId }: IssueTrackerProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      // Fetch issues
      const issuesResponse = await fetch(
        `https://api.github.com/repos/KoopaCode/${repoName}/issues?state=all&sort=created&direction=desc`
      );
      if (issuesResponse.ok) {
        const data = await issuesResponse.json();
        const relevantIssues = data.filter((issue: Issue) => 
          issue.body?.includes(commitId)
        );
        setIssues(relevantIssues);
        setLastUpdated(new Date());
      }

      // Fetch README
      const readmeResponse = await fetch(
        `https://api.github.com/repos/KoopaCode/${repoName}/readme`,
        {
          headers: {
            'Accept': 'application/vnd.github.raw+json'
          }
        }
      );
      if (readmeResponse.ok) {
        const readmeContent = await readmeResponse.text();
        setReadme(readmeContent);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [repoName, commitId]);

  // Function to handle image URLs
  const processImageUrl = (url: string) => {
    // Handle relative image paths
    if (url.startsWith('./') || url.startsWith('../')) {
      return `https://raw.githubusercontent.com/KoopaCode/${repoName}/main/${url.replace(/^[\.\/]+/, '')}`;
    }
    // Handle absolute paths within the repo
    if (url.startsWith('/')) {
      return `https://raw.githubusercontent.com/KoopaCode/${repoName}/main${url}`;
    }
    return url;
  };

  // Function to convert HTML-style image tags to markdown
  const convertHtmlToMarkdown = (content: string) => {
    return content.replace(
      /<p[^>]*align="([^"]*)"[^>]*>\s*<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>\s*<\/p>/g,
      (_, align, src, alt) => {
        return `\n\n![${alt}](${src})\n\n`;
      }
    );
  };

  const markdownComponents = {
    h1: ({ ...props }: MarkdownComponentProps) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
    h2: ({ ...props }: MarkdownComponentProps) => <h2 className="text-xl font-bold mb-3 text-white" {...props} />,
    h3: ({ ...props }: MarkdownComponentProps) => <h3 className="text-lg font-bold mb-2 text-white" {...props} />,
    p: ({ ...props }: MarkdownComponentProps) => <p className="mb-4 text-gray-200" {...props} />,
    ul: ({ ...props }: MarkdownComponentProps) => <ul className="list-disc pl-6 mb-4 text-gray-200" {...props} />,
    ol: ({ ...props }: MarkdownComponentProps) => <ol className="list-decimal pl-6 mb-4 text-gray-200" {...props} />,
    li: ({ ...props }: MarkdownComponentProps) => <li className="mb-1" {...props} />,
    strong: ({ ...props }: MarkdownComponentProps) => <strong className="font-bold text-white" {...props} />,
    em: ({ ...props }: MarkdownComponentProps) => <em className="italic text-gray-300" {...props} />,
    code: ({ inline, className, children, ...props }: MarkdownComponentProps) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (inline) {
        return (
          <code 
            className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-300" 
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <div className="relative group">
          {language && (
            <div className="absolute right-2 top-2 text-xs text-emerald-400 bg-gray-800/80 px-2 py-1 rounded">
              {language}
            </div>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(String(children))}
            className="absolute right-2 bottom-2 text-xs bg-gray-800/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-emerald-400"
          >
            Copy
          </button>
          <SyntaxHighlighter
            language={language || 'text'}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#1a1f29',
              border: '1px solid #2f3b4b',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },
    blockquote: ({ ...props }: MarkdownComponentProps) => (
      <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4 text-gray-300" {...props} />
    ),
    a: ({ ...props }: MarkdownComponentProps) => (
      <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <>
      {/* Download and Report Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700/50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-medium mb-2">Build Actions</h3>
            <p className="text-sm text-gray-300">
              Download this build or report any issues you encounter
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href={`/api/download?url=${encodeURIComponent(`https://api.github.com/repos/KoopaCode/${repoName}/actions/artifacts/${buildVersion}/zip`)}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Build
            </a>
            <button
              onClick={() => {
                const template = encodeURIComponent(`**Development Build Issue Report**\n\n**Build Information:**\n- Version: ${buildVersion}\n- Commit: ${commitId}\n- Build Date: ${new Date().toLocaleString()}\n\n**Description of the issue:**\n[Describe your issue here]\n\n**Steps to reproduce:**\n1. \n2. \n3. \n\n**Expected behavior:**\n[What did you expect to happen?]\n\n**Actual behavior:**\n[What actually happened?]\n\n**Server Information:**\n- Server Software: \n- Server Version: \n\n**Additional context:**\n[Any other relevant information]`);
                window.open(`https://github.com/KoopaCode/${repoName}/issues/new?body=${template}`, '_blank');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Build Issues</h3>
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        
        {issues.length > 0 ? (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.number}
                className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        issue.state === 'open' ? 'bg-red-500' : 'bg-green-500'
                      }`}></span>
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-white font-medium hover:text-blue-400 transition-colors text-left"
                      >
                        {issue.title}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-400">
                      <img 
                        src={issue.user.avatar_url} 
                        alt={issue.user.login}
                        className="w-4 h-4 rounded-full"
                      />
                      <span>{issue.user.login}</span>
                      <span>•</span>
                      <span>#{issue.number}</span>
                      <span>•</span>
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.state === 'open' 
                      ? 'bg-red-900/50 text-red-200 border border-red-700' 
                      : 'bg-green-900/50 text-green-200 border border-green-700'
                  }`}>
                    {issue.state}
                  </span>
                </div>
                
                {issue.labels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {issue.labels.map((label) => (
                      <span
                        key={label.name}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `#${label.color}20`,
                          color: `#${label.color}`,
                          border: `1px solid #${label.color}40`
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 flex justify-end space-x-2">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    View on GitHub
                  </a>
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400">No issues reported for this build version.</p>
          </div>
        )}
      </div>

      {/* Updated Issue Detail Modal with Markdown Support */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      selectedIssue.state === 'open' ? 'bg-red-500' : 'bg-green-500'
                    }`}></span>
                    <h2 className="text-2xl font-bold text-white">{selectedIssue.title}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={selectedIssue.user.avatar_url} 
                      alt={selectedIssue.user.login}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-gray-400">
                      {selectedIssue.user.login} opened this issue on {new Date(selectedIssue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="bg-gray-900 rounded-lg p-4 whitespace-pre-wrap border border-gray-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {selectedIssue.body}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <a
                  href={selectedIssue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* README Section */}
      {readme && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-white font-medium mb-4">Plugin Documentation</h3>
          <div className="prose prose-invert max-w-none bg-gray-800/80 rounded-lg p-4 border border-gray-700/50">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {convertHtmlToMarkdown(readme)}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
} 
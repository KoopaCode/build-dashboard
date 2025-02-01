'use client';

interface CreateIssueButtonProps {
  repoName: string;
  artifactName: string;
  commitId: string;
  createdAt: string;
}

export default function CreateIssueButton({ 
  repoName, 
  artifactName, 
  commitId, 
  createdAt 
}: CreateIssueButtonProps) {
  const createIssue = () => {
    const template = encodeURIComponent(`**Development Build Issue Report**

**Build Information:**
- Version: ${artifactName}
- Commit: ${commitId}
- Build Date: ${new Date(createdAt).toLocaleString()}
- Build URL: ${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}/${repoName}/${commitId}

**Description of the issue:**
[Describe your issue here]

**Steps to reproduce:**
1. 
2. 
3. 

**Expected behavior:**
[What did you expect to happen?]

**Actual behavior:**
[What actually happened?]

**Server Information:**
- Server Software: 
- Server Version: 

**Additional context:**
[Any other relevant information]

---
> This issue was created from the development build page.`);

    window.open(`https://github.com/KoopaCode/${repoName}/issues/new?body=${template}`, '_blank');
  };

  return (
    <button
      onClick={createIssue}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Report Issue
    </button>
  );
} 
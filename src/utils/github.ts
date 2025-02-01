import { Plugin, Artifact } from '@/types/github';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

async function fetchJavaRepos(): Promise<string[]> {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repos: ${response.statusText}`);
    }

    const repos = await response.json();
    
    // Filter for Java repositories by checking for pom.xml
    const javaRepos = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const pomResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/contents/pom.xml`,
            { headers }
          );
          if (pomResponse.ok) {
            return repo.name;
          }
        } catch (error) {
          // Ignore errors for repos without pom.xml
        }
        return null;
      })
    );

    return javaRepos.filter((repo): repo is string => repo !== null);
  } catch (error) {
    console.error('Error fetching Java repos:', error);
    return [];
  }
}

interface CommitInfo {
  message: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: {
    filename: string;
    additions: number;
    deletions: number;
    status: string;
  }[];
}

async function fetchCommitInfo(repoName: string, commitSha: string): Promise<CommitInfo | null> {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits/${commitSha}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch commit info: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      message: data.commit.message,
      stats: data.stats,
      files: data.files.map((file: any) => ({
        filename: file.filename,
        additions: file.additions,
        deletions: file.deletions,
        status: file.status
      }))
    };
  } catch (error) {
    console.error(`Error fetching commit info:`, error);
    return null;
  }
}

interface ArtifactResponse {
  id: number;
  name: string;
  size_in_bytes: number;
  url: string;
  archive_download_url: string;
  expired: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
  workflow_run: {
    id: number;
    repository_id: number;
    head_repository_id: number;
    head_branch: string;
    head_sha: string;
  };
}

async function getArtifactDownloadUrl(url: string): Promise<string> {
  // Instead of returning the URL, we'll return a base64 encoded version of the URL and token
  // This will be decoded client-side when downloading
  return Buffer.from(`${url}:${GITHUB_TOKEN}`).toString('base64');
}

export async function fetchPluginData(repoName: string): Promise<Plugin> {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    // Fetch repository info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
      { headers }
    );
    
    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repo data: ${repoResponse.statusText}`);
    }
    
    const repoData = await repoResponse.json();

    // Fetch artifacts
    const artifactsResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/actions/artifacts?per_page=5`,
      { headers }
    );
    
    if (!artifactsResponse.ok) {
      throw new Error(`Failed to fetch artifacts: ${artifactsResponse.statusText}`);
    }
    
    const artifactsData = await artifactsResponse.json();

    const artifactsWithCommitInfo = await Promise.all(
      (artifactsData.artifacts || []).map(async (artifact: ArtifactResponse) => {
        const commitInfo = artifact.workflow_run?.head_sha 
          ? await fetchCommitInfo(repoName, artifact.workflow_run.head_sha)
          : null;

        // Get the actual download URL
        const downloadUrl = `/api/download?url=${encodeURIComponent(artifact.archive_download_url)}&name=${encodeURIComponent(artifact.name)}`;

        return {
          name: artifact.name,
          downloadUrl: downloadUrl || '#', // Fallback if download URL fails
          createdAt: artifact.created_at,
          size: Math.round(artifact.size_in_bytes / 1024),
          expiresAt: artifact.expires_at,
          workflowRun: {
            headSha: artifact.workflow_run?.head_sha?.substring(0, 7) || 'unknown',
            headBranch: artifact.workflow_run?.head_branch || 'unknown',
            conclusion: 'success',
            createdAt: artifact.created_at
          },
          commitInfo
        };
      })
    );

    return {
      name: repoData.name,
      repoName: repoName,
      description: repoData.description || 'No description available',
      artifacts: artifactsWithCommitInfo
    };
  } catch (error) {
    console.error(`Error fetching data for ${repoName}:`, error);
    return {
      name: repoName,
      repoName: repoName,
      description: 'Failed to load repository data',
      artifacts: []
    };
  }
}

export { fetchJavaRepos };

export async function fetchCommitDetails(repoName: string, commitSha: string) {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits/${commitSha}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch commit details: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      message: data.commit.message,
      author: data.commit.author,
      stats: data.stats,
      files: data.files,
      html_url: data.html_url,
    };
  } catch (error) {
    console.error('Error fetching commit details:', error);
    return null;
  }
} 
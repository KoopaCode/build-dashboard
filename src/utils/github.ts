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
    
    // Filter for Java repositories by checking for presence of pom.xml or build.gradle
    const javaRepos = await Promise.all(
      repos.map(async (repo: any) => {
        const [pomExists, gradleExists] = await Promise.all([
          checkFileExists(repo.name, 'pom.xml'),
          checkFileExists(repo.name, 'build.gradle'),
        ]);

        return (pomExists || gradleExists) ? repo.name : null;
      })
    );

    return javaRepos.filter((repo): repo is string => repo !== null);
  } catch (error) {
    console.error('Error fetching Java repos:', error);
    return [];
  }
}

async function checkFileExists(repoName: string, filename: string): Promise<boolean> {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${filename}`,
      { headers }
    );
    return response.status === 200;
  } catch {
    return false;
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

async function fetchPluginData(repoName: string): Promise<Plugin | null> {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    // Fetch repository details
    const repoResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
      { headers }
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return null; // Silently handle 404 for favicon.ico and other invalid repos
      }
      throw new Error(`Failed to fetch repo info: ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    // Fetch both artifacts and releases
    const [artifactsResponse, releasesResponse] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/actions/artifacts?per_page=100`,
        { headers }
      ),
      fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/releases?per_page=100`,
        { headers }
      )
    ]);

    if (!artifactsResponse.ok) {
      throw new Error(`Failed to fetch artifacts: ${artifactsResponse.statusText}`);
    }

    if (!releasesResponse.ok) {
      throw new Error(`Failed to fetch releases: ${releasesResponse.statusText}`);
    }

    const [artifactsData, releasesData] = await Promise.all([
      artifactsResponse.json(),
      releasesResponse.json()
    ]);

    // Process artifacts and fetch commit info for each
    const artifacts = await Promise.all([
      // Process workflow artifacts
      ...artifactsData.artifacts.map(async (artifact: Artifact) => {
        const commitInfo = await fetchCommitInfo(repoName, artifact.workflow_run.head_sha);
        
        return {
          name: artifact.name,
          downloadUrl: await getArtifactDownloadUrl(artifact.archive_download_url),
          createdAt: artifact.created_at,
          size: artifact.size_in_bytes,
          expiresAt: new Date(new Date(artifact.created_at).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          workflowRun: {
            headSha: artifact.workflow_run.head_sha,
            headBranch: 'main',
            conclusion: artifact.workflow_run.conclusion || 'success',
            createdAt: artifact.workflow_run.created_at || artifact.created_at,
          },
          commitInfo,
          type: 'workflow'
        };
      }),
      // Process releases
      ...releasesData.map(async (release: any) => {
        const commitInfo = await fetchCommitInfo(repoName, release.target_commitish);
        
        return {
          name: release.name || release.tag_name,
          downloadUrl: release.assets[0]?.browser_download_url || '',
          createdAt: release.created_at,
          size: release.assets[0]?.size || 0,
          expiresAt: null, // Releases don't expire
          workflowRun: {
            headSha: release.target_commitish,
            headBranch: 'main',
            conclusion: 'success',
            createdAt: release.created_at,
          },
          commitInfo,
          type: 'release',
          releaseInfo: {
            tagName: release.tag_name,
            body: release.body,
            isDraft: release.draft,
            isPrerelease: release.prerelease
          }
        };
      })
    ]);

    // Filter out any failed artifacts and sort by creation date
    const validArtifacts = artifacts
      .filter(artifact => 
        artifact && 
        (artifact.type === 'release' || !artifact.workflowRun.conclusion || artifact.workflowRun.conclusion === 'success')
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      name: repoData.name,
      repoName: repoData.name,
      description: repoData.description || 'No description available',
      artifacts: validArtifacts,
    };
  } catch (error) {
    if (repoName === 'favicon.ico') {
      return null; // Silently handle favicon.ico requests
    }
    console.error(`Error fetching plugin data for ${repoName}:`, error);
    return null;
  }
}

async function fetchCommitDetails(repoName: string, commitSha: string) {
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

export {
  fetchJavaRepos,
  fetchPluginData,
  fetchCommitDetails
}; 
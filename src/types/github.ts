export interface CommitInfo {
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

export interface Plugin {
  name: string;
  repoName: string;
  description: string;
  artifacts: {
    name: string;
    downloadUrl: string;
    createdAt: string;
    size: number;
    expiresAt: string;
    workflowRun: {
      headSha: string;
      headBranch: string;
      conclusion: string;
      createdAt: string;
    };
    commitInfo?: CommitInfo;
  }[];
}

export interface Artifact {
  id: number;
  name: string;
  size_in_bytes: number;
  url: string;
  created_at: string;
  workflow_run: {
    head_sha: string;
    conclusion: string;
    created_at: string;
  };
}

export interface Release {
  tag_name: string;
  assets: {
    browser_download_url: string;
    created_at: string;
  }[];
} 
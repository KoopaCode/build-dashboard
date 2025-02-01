export interface VercelDeploymentWebhook {
  id: string;
  url: string;
  name: string;
  type: 'deployment.succeeded' | 'deployment.failed' | 'deployment.ready';
  createdAt: string;
  teamId: string | null;
  projectId: string;
  deployment: {
    id: string;
    url: string;
    name: string;
    meta: {
      githubCommitRef: string;
      githubCommitSha: string;
      githubCommitMessage: string;
      githubCommitAuthorName: string;
    };
    plan: string;
    status: string;
    createdAt: number;
    creator: {
      email: string;
      username: string;
    };
  };
} 
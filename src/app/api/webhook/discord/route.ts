import { NextResponse } from 'next/server';
import type { VercelDeploymentWebhook } from '@/types/webhook';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

function getStatusEmoji(type: string) {
  switch (type) {
    case 'deployment.succeeded':
      return '✅';
    case 'deployment.failed':
      return '❌';
    case 'deployment.ready':
      return '🚀';
    default:
      return '📦';
  }
}

function getStatusColor(type: string) {
  switch (type) {
    case 'deployment.succeeded':
      return 0x00ff00; // Green
    case 'deployment.failed':
      return 0xff0000; // Red
    case 'deployment.ready':
      return 0x0099ff; // Blue
    default:
      return 0x808080; // Gray
  }
}

export async function POST(request: Request) {
  try {
    const payload: VercelDeploymentWebhook = await request.json();

    const { type, deployment } = payload;
    const { url, meta } = deployment;

    const embed = {
      title: `${getStatusEmoji(type)} Deployment ${type.split('.')[1].toUpperCase()}`,
      color: getStatusColor(type),
      fields: [
        {
          name: 'Environment',
          value: deployment.name,
          inline: true,
        },
        {
          name: 'Branch',
          value: meta.githubCommitRef || 'Unknown',
          inline: true,
        },
        {
          name: 'Commit',
          value: meta.githubCommitSha ? `[\`${meta.githubCommitSha.substring(0, 7)}\`](https://github.com/KoopaCode/build-dashboard/commit/${meta.githubCommitSha})` : 'Unknown',
          inline: true,
        },
        {
          name: 'Commit Message',
          value: meta.githubCommitMessage || 'No message provided',
        },
        {
          name: 'Deployment URL',
          value: url,
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: `Deployed by ${deployment.creator.username}`
      }
    };

    const discordPayload = {
      embeds: [embed]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 
import { fetchJavaRepos, fetchPluginData } from '@/utils/github';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Add cache control headers
    const headers = {
      'Cache-Control': 'no-store, must-revalidate',
      'Pragma': 'no-cache',
    };

    const repos = await fetchJavaRepos();
    const pluginsWithNull = await Promise.all(
      repos.map(repo => fetchPluginData(repo))
    );
    const plugins = pluginsWithNull.filter(plugin => plugin !== null);
    
    return NextResponse.json({
      plugins,
      timestamp: new Date().toISOString(),
    }, { headers });
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
} 
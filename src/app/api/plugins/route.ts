import { fetchJavaRepos, fetchPluginData } from '@/utils/github';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const repos = await fetchJavaRepos();
    const pluginsWithNull = await Promise.all(
      repos.map(repo => fetchPluginData(repo))
    );
    const plugins = pluginsWithNull.filter(plugin => plugin !== null);
    
    return NextResponse.json(plugins);
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
  }
} 
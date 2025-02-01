import { fetchPluginData, fetchJavaRepos } from '@/utils/github';
import { Suspense } from 'react';
import ClientSearch from './components/ClientSearch';
import { Plugin } from '@/types/github';

// This is now a server component that fetches data
async function getPlugins(): Promise<Plugin[]> {
  try {
    const repos = await fetchJavaRepos();
    const pluginsWithNull = await Promise.all(
      repos.map(repo => fetchPluginData(repo))
    );
    // Filter out null values and cast to Plugin[]
    const plugins = pluginsWithNull.filter((plugin): plugin is Plugin => plugin !== null);
    return plugins;
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return [];
  }
}

export default async function Home() {
  const plugins = await getPlugins();

  return (
    <main className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Development Builds
          </h1>
          <p className="text-xl text-gray-400">
            Latest Minecraft plugin builds from KoopaLabs
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ClientSearch initialPlugins={plugins} />
        </Suspense>
      </div>
    </main>
  );
} 
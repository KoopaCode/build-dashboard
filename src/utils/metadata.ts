import { Metadata } from 'next';

export function generateMetadata({
  title,
  description,
  image = 'https://lapislabs.dev/images/KoopaLabs.png',
  path = ''
}: {
  title: string;
  description: string;
  image?: string;
  path?: string;
}): Metadata {
  const baseUrl = 'https://builds.koopalabs.dev';
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      url,
      siteName: 'KoopaLabs Plugin Builds',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
} 
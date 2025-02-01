import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const fileName = searchParams.get('name');
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to download artifact: ${response.statusText}`, { status: response.status });
    }

    // Get the content disposition header from GitHub's response
    const githubContentDisposition = response.headers.get('content-disposition');
    const githubContentType = response.headers.get('content-type');

    const data = await response.blob();
    
    // Use GitHub's headers if available, fallback to our provided filename
    return new NextResponse(data, {
      headers: {
        'Content-Type': githubContentType || 'application/octet-stream',
        'Content-Disposition': githubContentDisposition || `attachment; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Failed to download artifact', { status: 500 });
  }
} 
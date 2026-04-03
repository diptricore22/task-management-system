import { NextRequest, NextResponse } from 'next/server';

// API proxy to forward requests to Express server
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path, 'DELETE');
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path, 'OPTIONS');
}

async function forwardRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003';
    const path = pathSegments.join('/');
    const url = `${API_BASE_URL}/api/${path}`;

    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const fullUrl = searchParams.size > 0
      ? `${url}?${searchParams.toString()}`
      : url;

    // Prepare headers
    const headers = new Headers();

    // Copy relevant headers from the original request
    const headersToForward = [
      'content-type',
      'authorization',
      'user-agent',
      'accept',
      'accept-language',
      'accept-encoding',
      'cookie',
    ];

    headersToForward.forEach(headerName => {
      const value = request.headers.get(headerName);
      if (value) {
        headers.set(headerName, value);
      }
    });

    // Prepare request body for methods that support it
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    // Forward the request to Express API
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      // Forward credentials
      credentials: 'include',
    });

    // Create response headers
    const responseHeaders = new Headers();

    // Copy response headers
    const headersToReturn = [
      'content-type',
      'set-cookie',
      'cache-control',
      'expires',
      'last-modified',
      'etag',
    ];

    headersToReturn.forEach(headerName => {
      const value = response.headers.get(headerName);
      if (value) {
        responseHeaders.set(headerName, value);
      }
    });

    // Handle CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // Get response body
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('API proxy error:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'PROXY_ERROR',
      },
      { status: 500 }
    );
  }
}
const backendOrigin = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:8000';

function buildTargetUrl(pathSegments, searchParams) {
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : '';
  const url = new URL(`${backendOrigin.replace(/\/$/, '')}/api/${path}`);

  if (searchParams) {
    for (const [key, value] of searchParams.entries()) {
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}

async function proxyRequest(request, context) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = buildTargetUrl(path, incomingUrl.searchParams);

  const headers = {
    Accept: 'application/json',
    'Content-Type': request.headers.get('content-type') || 'application/json',
    Authorization: request.headers.get('authorization') || '',
  };

  const init = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.text();
  }

  try {
    const backendResponse = await fetch(targetUrl, init);
    const text = await backendResponse.text();

    return new Response(text, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('content-type') || 'application/json; charset=utf-8',
      },
    });
  } catch {
    return Response.json(
      {
        message: 'Backend API is unavailable',
        backendOrigin,
      },
      { status: 503 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

const backendOrigin = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:8000';
const backendApiPrefix = process.env.BACKEND_API_PREFIX || '/api';

function normalizePrefix(prefix) {
  if (!prefix) return '';
  const withSlash = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return withSlash.replace(/\/+$/, '');
}

function buildTargetUrl(pathSegments = [], searchParams) {
  const joined = Array.isArray(pathSegments) ? pathSegments.join('/') : '';
  const base = backendOrigin.replace(/\/+$/, '');
  const prefix = normalizePrefix(backendApiPrefix);
  const path = joined ? `/${joined}` : '';
  const url = new URL(`${base}${prefix}${path}`);

  if (searchParams) {
    for (const [key, value] of searchParams.entries()) {
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}

async function proxyRequest(request, { params }) {
  const incomingUrl = new URL(request.url);
  const targetUrl = buildTargetUrl(params?.path, incomingUrl.searchParams);

async function proxyRequest(request, ctx) {
  const incomingUrl = new URL(request.url);

  const rawParams = ctx?.params;
  const resolvedParams = rawParams && typeof rawParams.then === 'function'
    ? await rawParams
    : rawParams;

  const pathSegments = resolvedParams?.path || [];
  const targetUrl = buildTargetUrl(pathSegments, incomingUrl.searchParams);


  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('host');
  requestHeaders.delete('connection');
  requestHeaders.delete('content-length');

  const init = {
    method: request.method,
    headers: requestHeaders,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    redirect: 'manual',
    cache: 'no-store',
  };

  try {
    const backendResponse = await fetch(targetUrl, init);
    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: 'Backend API is unavailable',
        details: error.message,
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

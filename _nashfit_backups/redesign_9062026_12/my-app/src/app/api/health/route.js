const backendOrigin = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:8000';
const backendApiPrefix = process.env.BACKEND_API_PREFIX || '/api';

function normalizePrefix(prefix) {
  if (!prefix) return '';
  const withSlash = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return withSlash.replace(/\/+$/, '');
}

export async function GET() {
  const prefix = normalizePrefix(backendApiPrefix);
  const target = `${backendOrigin.replace(/\/+$/, '')}${prefix}/health`;

  try {
    const response = await fetch(target, { cache: 'no-store' });
    const payload = await response.json().catch(() => null);

    if (response.ok) {
      return Response.json({
        ok: true,
        message: 'Backend health check passed',
        backendStatus: response.status,
        backendResponse: payload,
      });
    }

    return Response.json(
      {
        ok: false,
        error: 'Backend health endpoint responded with error',
        backendStatus: response.status,
        backendResponse: payload,
      },
      { status: 502 },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || 'Unable to reach backend health endpoint',
      },
      { status: 503 },
    );
  }
}

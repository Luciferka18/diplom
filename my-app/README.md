# my-app frontend

## API connection model

Frontend always calls relative URLs (`/api/*`).

- Browser requests go to Next.js (`localhost:3000/api/...`).
- Next.js Route Handler (`app/api/[...path]/route.js`) proxies these calls to backend (`BACKEND_ORIGIN/api/...`).

By default:

- `BACKEND_ORIGIN=http://127.0.0.1:8000`

You can override it in `.env.local`:

```env
BACKEND_ORIGIN=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=/api
```

This avoids CORS issues and keeps client/server requests consistent.

If backend is unavailable, proxy returns `503` JSON instead of crashing page rendering.

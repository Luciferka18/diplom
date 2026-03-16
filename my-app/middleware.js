import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Проксируем API запросы на Laravel
  if (pathname.startsWith('/api/')) {
    const backendUrl = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:8000'
    const url = new URL(`${backendUrl}${pathname}`)
    url.search = request.nextUrl.search

    const headers = new Headers(request.headers)
    headers.delete('host')

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    })

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

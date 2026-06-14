// src/app/api/[...path]/route.js
import { NextResponse } from "next/server";

const backendOrigin = (process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000").replace(/\/+$/, "");
const backendApiPrefix = (process.env.BACKEND_API_PREFIX || "/api").replace(/\/+$/, "");

function buildTarget(reqUrl, pathParts) {
  const url = new URL(reqUrl);
  const parts = Array.isArray(pathParts) ? pathParts : [];
  const path = parts.join("/");
  return `${backendOrigin}${backendApiPrefix}/${path}${url.search}`;
}

async function forward(req, ctx) {
  // Next 16: params может быть Promise
  const params = ctx?.params ? await ctx.params : {};
  const target = buildTarget(req.url, params.path);

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const headers = new Headers();
  headers.set("accept", "application/json");

  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  // ✅ пробрасываем Authorization если клиент прислал
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  // ✅ пробрасываем cookies (санктум/сессии если используешь)
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const r = await fetch(target, {
    method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const respCT = r.headers.get("content-type") || "";

  // если вернулся JSON
  if (respCT.toLowerCase().includes("application/json")) {
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  }

  // если Laravel вернул HTML/текст — покажем как JSON, чтобы видеть проблему
  const text = await r.text().catch(() => "");
  return NextResponse.json(
    {
      message: "Backend returned non-JSON response",
      status: r.status,
      content_type: respCT,
      raw: text.slice(0, 5000),
    },
    { status: r.status }
  );
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;

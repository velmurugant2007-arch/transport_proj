import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Routes that don't require authentication ──────────────────
const PUBLIC_PREFIXES = ["/login", "/register", "/api/auth", "/api/debug", "/_next", "/favicon"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    /\.(ico|png|jpg|jpeg|svg|webp|css|js|map|woff2?)$/.test(pathname)
  );
}

// ── Build Content Security Policy ─────────────────────────────
function buildCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives: Record<string, string> = {
    "default-src":               "'self'",
    "script-src":                isDev ? "'self' 'unsafe-eval' 'unsafe-inline'" : "'self' 'unsafe-inline'",
    "style-src":                 "'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src":                  "'self' https://fonts.gstatic.com",
    "img-src":                   "'self' data: blob: https://*.google.com https://*.googleapis.com https://*.openstreetmap.org https://*.arcgisonline.com https://unpkg.com",
    "connect-src":               isDev ? "'self' ws://localhost:* wss://localhost:*" : "'self'",
    "frame-src":                 "'none'",
    "frame-ancestors":           "'none'",
    "object-src":                "'none'",
    "base-uri":                  "'self'",
    "form-action":               "'self'",
  };

  return Object.entries(directives)
    .map(([k, v]) => (v ? `${k} ${v}` : k))
    .join("; ");
}

// ── Security headers applied to every response ─────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options":        "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy":        "strict-origin-when-cross-origin",
  "Permissions-Policy":     "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

// ── Middleware (auth guard + security headers) ─────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  // Attach security headers on every response
  response.headers.set("Content-Security-Policy", buildCSP());
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }

  // Skip auth check for public/static paths
  if (isPublic(pathname)) {
    return response;
  }

  // Verify JWT session token
  const token = await getToken({
    req:    request,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!token) {
    // Redirect unauthenticated users — pass pathname raw, next-auth handles encoding
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

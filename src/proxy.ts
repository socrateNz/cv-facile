import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "cvfacile_token";

const PROTECTED_PREFIXES = [
  "/templates",
  "/cv",
  "/my-cvs",
  "/preview",
  "/admin",
];

type JwtPayload = {
  exp?: number;
  role?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const part = token.split(".")[1];
  if (!part) return null;

  try {
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token || !isTokenValid(token)) {
    return redirectToLogin(request);
  }

  const payload = decodeJwtPayload(token);

  if (pathname.startsWith("/admin") && payload?.role !== "admin") {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/templates/:path*",
    "/cv/:path*",
    "/my-cvs/:path*",
    "/preview/:path*",
    "/admin/:path*",
  ],
};

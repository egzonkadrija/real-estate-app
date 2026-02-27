import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const SUPPORTED_LOCALES = new Set(routing.locales);
const ADMIN_TOKEN_COOKIE = "admin-token";
const intlMiddleware = createMiddleware(routing);

function isAdminJwtToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const payloadPart = parts[1];
    const padded = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        payloadPart.length + ((4 - (payloadPart.length % 4)) % 4),
        "="
      );

    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as {
      role?: string;
      exp?: number;
    };

    if (payload.role !== "admin") {
      return false;
    }

    if (typeof payload.exp !== "number") {
      return true;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function getAdminContext(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const second = segments[1];

  const isRootAdmin = first === "admin";
  const isLocaleAdmin = !!first && SUPPORTED_LOCALES.has(first) && second === "admin";
  const isAdminPath = isRootAdmin || isLocaleAdmin;

  if (!isAdminPath) {
    return null;
  }

  const base = isLocaleAdmin ? `/${first}/admin` : "/admin";
  const isAdminLogin = isLocaleAdmin ? segments[2] === "login" : second === "login";
  const isAdminBase = isLocaleAdmin ? segments.length === 2 : segments.length === 1;
  const isPublicAdminPath = isAdminLogin || isAdminBase;

  return {
    base,
    isAdminLogin,
    isPublicAdminPath,
    loginPath: `${base}/login`,
    dashboardPath: `${base}/dashboard`,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminContext = getAdminContext(pathname);
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const isAdminUser = token ? isAdminJwtToken(token) : false;

  if (adminContext) {
    if (!adminContext.isPublicAdminPath && !isAdminUser) {
      const response = NextResponse.redirect(
        new URL(adminContext.loginPath, request.url)
      );
      response.cookies.delete(ADMIN_TOKEN_COOKIE, { path: "/" });
      return response;
    }

    if (adminContext.isAdminLogin && isAdminUser) {
      return NextResponse.redirect(
        new URL(adminContext.dashboardPath, request.url)
      );
    }
  }

  if (pathname.startsWith("/api/")) {
    if (isAdminUser && token) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("authorization", `Bearer ${token}`);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|_vercel|uploads|.*\\..*).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CURRENT_PATH_HEADER } from "@/shared/lib/security/callback-url";

const PUBLIC_PREFIXES = [
  "/reset-password/",
  "/verify-email/",
  "/api/auth/",
  "/api/health",
  "/_next/",
  "/favicon.ico",
  "/news",
  "/staff",
  "/curriculum",
  "/rooms",
  "/services",
  "/verify",
  "/attendance",
  "/documents",
  "/projects",
  "/about",
  "/uploads",
  "/images",
];
const PUBLIC_EXACT = ["/"];
const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

/** ด่านตรวจระดับ route — ไม่แตะ DB (edge) · สิทธิ์ละเอียดตรวจใน Server Action ผ่าน requirePermission */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isPublic = PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  const proto = req.headers.get("x-forwarded-proto");
  const secureCookie = proto === "https" || req.nextUrl.protocol === "https:" || (process.env.APP_URL ?? "").startsWith("https://");
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie });
  const loggedIn = !!token && !token.invalid && !!token.userId;

  if (isPublic) {
    if (loggedIn && token?.mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", req.url));
    }
    return NextResponse.next();
  }

  if (GUEST_ONLY.includes(pathname)) {
    return loggedIn ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }

  if (!loggedIn) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login);
  }
  if (token?.mustChangePassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }
  const headers = new Headers(req.headers);
  headers.set(CURRENT_PATH_HEADER, pathname + search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

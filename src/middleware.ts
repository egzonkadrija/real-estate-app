import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(al|en|de)/:path*",
    "/((?!api|_next|_vercel|uploads|.*\\..*).*)",
  ],
};

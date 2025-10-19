import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!_next|_health|api/upload|api/extract|api/me|chat|kundali|cards|dashboard|sitemap|robots|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};

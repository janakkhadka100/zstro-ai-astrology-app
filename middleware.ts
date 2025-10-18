import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!_next|_health|api|kundali|daily-horoscope|compatibility|chart|sitemap|robots|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};

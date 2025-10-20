import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!_next|api|login|register|forgot-password|reset-password|location-demo|sitemap|robots|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};

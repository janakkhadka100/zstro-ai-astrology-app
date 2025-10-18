import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api/astrology/kundali|kundali|_health|_next/static|_next/image|favicon.ico).*)'],
};

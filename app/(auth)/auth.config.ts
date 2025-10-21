import { get } from 'http';
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      // Allow all API routes without authentication
      if (nextUrl.pathname.startsWith('/api')) {
        return true;
      }

      const isOnAdmin = nextUrl.pathname.startsWith("/dashboard");
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/') && !nextUrl.pathname.startsWith('/api');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnForgotPassword = nextUrl.pathname.startsWith('/forgot-password');
      const isOnResetPassword = nextUrl.pathname.startsWith('/reset-password');

      if (isOnAdmin) {
        let role = "user";
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        if(auth?.user) {
          const response = await fetch(`${baseUrl}/api/users/${auth.user.email}/role`);
          const userRole = await response.json();
          if(userRole && userRole.role) {
            role = userRole.role;
          }
        }
        if (isLoggedIn && role === "admin") return true;
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin ||isOnForgotPassword || isOnResetPassword ) {
        return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        return true; // Allow access to main page without authentication
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },

  },
} satisfies NextAuthConfig;

import type { Metadata } from 'next';
import { Toaster } from 'sonner';

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic";

import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/lib/i18n/context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://zstro-ai-astrology.vercel.app'),
  title: {
    default: 'ZSTRO AI ASTROLOGY - Nepal\'s First AI Astrology Service',
    template: '%s | ZSTRO AI ASTROLOGY'
  },
  description: 'Generate accurate Kundali charts, daily horoscopes, and astrological compatibility reports with AI-powered analysis. Nepal\'s premier astrology service.',
  keywords: ['astrology', 'kundali', 'horoscope', 'Nepal', 'AI', 'birth chart', 'compatibility', 'zodiac'],
  authors: [{ name: 'ZSTRO AI' }],
  creator: 'ZSTRO AI',
  publisher: 'ZSTRO AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zstro-ai-astrology.vercel.app',
    siteName: 'ZSTRO AI ASTROLOGY',
    title: 'ZSTRO AI ASTROLOGY - Nepal\'s First AI Astrology Service',
    description: 'Generate accurate Kundali charts, daily horoscopes, and astrological compatibility reports with AI-powered analysis.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ZSTRO AI ASTROLOGY',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZSTRO AI ASTROLOGY - Nepal\'s First AI Astrology Service',
    description: 'Generate accurate Kundali charts, daily horoscopes, and astrological compatibility reports with AI-powered analysis.',
    images: ['/twitter-image.png'],
    creator: '@zstroai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100..900&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Toaster position="top-center" />
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

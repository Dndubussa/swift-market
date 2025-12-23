import '../styles/index.css';
import { Providers } from '@/components/Providers';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalFooter from '@/components/common/ConditionalFooter';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Blinno - Marketplace Platform',
  description: 'Multi-vendor marketplace platform with secure payments and real-time tracking',
  icons: {
    icon: [
      { url: '/assets/images/favicon-1766139688438.png', type: 'image/png' }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/logo.png" as="image" />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <Providers>
          <div className="min-h-screen flex flex-col relative">
            <ConditionalHeader />
            <main className="flex-grow relative z-0">{children}</main>
            <ConditionalFooter />
          </div>
        </Providers>
      
      <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fblinnomar3765back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.12" />
      <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}
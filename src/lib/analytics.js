'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useGoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    if (!window.dataLayer) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head?.appendChild(script);

      window.dataLayer = [];
      window.gtag = function() { window.dataLayer?.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    window.gtag('event', 'page_view', { page_path: url });
  }, [pathname, searchParams]);
}

export function trackEvent(eventName, eventParams = {}) {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}
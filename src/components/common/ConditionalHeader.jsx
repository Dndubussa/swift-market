'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

// Routes where main header should be hidden (dashboard pages have their own header)
const noHeaderRoutes = [
  '/user-login',
  '/user-registration',
  '/forgot-password',
  '/reset-password',
  '/buyer-dashboard',
  '/vendor-dashboard',
  '/admin-panel',
  '/vendor-store-management',
];

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Check if current path starts with any of the no-header routes
  const shouldHideHeader = noHeaderRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}


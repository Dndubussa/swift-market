'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// Routes where footer should be hidden
const noFooterRoutes = [
  '/user-login',
  '/user-registration',
  '/forgot-password',
  '/reset-password',
  '/buyer-dashboard',
  '/vendor-dashboard',
  '/admin-panel',
  '/vendor-store-management',
  '/checkout',
  '/shopping-cart',
  '/my-downloads',
];

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Check if current path starts with any of the no-footer routes
  const shouldHideFooter = noFooterRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}


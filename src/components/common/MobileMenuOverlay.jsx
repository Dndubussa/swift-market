'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function MobileMenuOverlay({ isOpen = false, onClose, user = null, onLogout }) {
  if (!isOpen) return null;

  const getDashboardLink = () => {
    if (!user) return '/user-login';
    if (user?.role === 'admin') return '/admin-panel';
    if (user?.role === 'vendor') return '/vendor-dashboard';
    return '/buyer-dashboard';
  };

  const navigationItems = [
    { label: 'Shop', path: '/product-catalog', icon: 'ShoppingBagIcon' },
    { label: 'Cart', path: '/shopping-cart', icon: 'ShoppingCartIcon' },
    { label: 'Orders', path: '/order-tracking', icon: 'ClipboardDocumentListIcon' },
  ];

  if (user) {
    navigationItems?.push({ label: 'Dashboard', path: getDashboardLink(), icon: 'ChartBarIcon' });
    if (user?.role === 'vendor') {
      navigationItems?.push({ label: 'Store Management', path: '/vendor-store-management', icon: 'BuildingStorefrontIcon' });
    }
  }

  return (
    <div className="fixed inset-0 z-[200] md:hidden">
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-card shadow-modal animate-slide-in-right overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <span className="text-lg font-heading font-semibold text-foreground">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
            aria-label="Close menu"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {user && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-lg font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full capitalize">
                    {user?.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path || item?.label}
              href={item?.path || '#'}
              className="flex items-center space-x-3 px-4 py-3 rounded-md text-foreground hover:bg-muted transition-all duration-200 group"
              onClick={onClose}
            >
              <Icon name={item?.icon} size={22} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="font-medium">{item?.label}</span>
            </Link>
          ))}

          {!user ? (
            <div className="pt-4 space-y-2 border-t border-border mt-4">
              <Link
                href="/user-login"
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-md border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium"
                onClick={onClose}
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                <span>Login</span>
              </Link>
              <Link
                href="/user-registration"
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 font-medium"
                onClick={onClose}
              >
                <Icon name="UserPlusIcon" size={20} />
                <span>Register</span>
              </Link>
            </div>
          ) : (
            <div className="pt-4 border-t border-border mt-4">
              <button
                onClick={() => {
                  onClose();
                  onLogout?.();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-error hover:bg-error/10 transition-all duration-200 font-medium"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={22} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 Blinno Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
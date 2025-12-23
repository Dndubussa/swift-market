'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

// Vendor navigation config
const VENDOR_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/vendor-dashboard',
    exact: true
  },
  {
    id: 'products',
    label: 'Products',
    icon: 'CubeIcon',
    children: [
      { id: 'all-products', label: 'All Products', href: '/vendor-store-management' },
      { id: 'add-product', label: 'Add Product', href: '/vendor-store-management/add-product' }
    ]
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/vendor-dashboard/orders',
    badge: 'orders'
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: 'ArrowUturnLeftIcon',
    href: '/vendor-dashboard/returns',
    badge: 'returns'
  },
  {
    id: 'disputes',
    label: 'Disputes',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/vendor-dashboard/disputes',
    badge: 'disputes'
  },
  { type: 'divider' },
  {
    id: 'payouts',
    label: 'Earnings & Payouts',
    icon: 'BanknotesIcon',
    href: '/vendor-dashboard/payouts'
  },
  {
    id: 'tier',
    label: 'Seller Tier',
    icon: 'TrophyIcon',
    href: '/vendor-dashboard/seller-tier'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'BellIcon',
    href: '/vendor-dashboard/notifications',
    badge: 'notifications'
  },
  { type: 'divider' },
  {
    id: 'settings',
    label: 'Store Settings',
    icon: 'Cog6ToothIcon',
    href: '/vendor-store-management'
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: 'QuestionMarkCircleIcon',
    href: '/help'
  }
];

// Buyer navigation config
const BUYER_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/buyer-dashboard',
    exact: true
  },
  {
    id: 'orders',
    label: 'My Orders',
    icon: 'ShoppingBagIcon',
    href: '/buyer-dashboard/orders'
  },
  {
    id: 'downloads',
    label: 'My Downloads',
    icon: 'ArrowDownTrayIcon',
    href: '/buyer-dashboard/my-downloads'
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: 'HeartIcon',
    href: '/buyer-dashboard/wishlist'
  },
  {
    id: 'reviews',
    label: 'My Reviews',
    icon: 'StarIcon',
    href: '/buyer-dashboard/reviews'
  },
  { type: 'divider' },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'BellIcon',
    href: '/buyer-dashboard/notifications',
    badge: 'notifications'
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: 'GiftIcon',
    href: '/buyer-dashboard/rewards'
  },
  { type: 'divider' },
  {
    id: 'profile',
    label: 'Profile Settings',
    icon: 'UserCircleIcon',
    href: '/buyer-dashboard/profile'
  },
  {
    id: 'addresses',
    label: 'Addresses',
    icon: 'MapPinIcon',
    href: '/buyer-dashboard/addresses'
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: 'QuestionMarkCircleIcon',
    href: '/help'
  }
];

// Admin navigation config
const ADMIN_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/admin-panel',
    exact: true
  },
  {
    id: 'vendors',
    label: 'Vendor Management',
    icon: 'BuildingStorefrontIcon',
    children: [
      { id: 'vendor-list', label: 'All Vendors', href: '/admin-panel/vendors' },
      { id: 'vendor-approvals', label: 'Pending Approvals', href: '/admin-panel/vendors/approvals' },
      { id: 'seller-grading', label: 'Seller Grading', href: '/admin-panel/vendors/grading' },
      { id: 'tier-management', label: 'Tier Management', href: '/admin-panel/vendors/tiers' }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'UsersIcon',
    href: '/admin-panel/users'
  },
  {
    id: 'products',
    label: 'Products',
    icon: 'CubeIcon',
    children: [
      { id: 'all-products', label: 'All Products', href: '/admin-panel/products' },
      { id: 'moderation', label: 'Moderation Queue', href: '/admin-panel/products/moderation' },
      { id: 'categories', label: 'Categories', href: '/admin-panel/products/categories' },
      { id: 'inventory', label: 'Inventory Overview', href: '/admin-panel/products/inventory' }
    ]
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    children: [
      { id: 'all-orders', label: 'All Orders', href: '/admin-panel/orders' },
      { id: 'fulfillment', label: 'Fulfillment', href: '/admin-panel/orders/fulfillment' },
      { id: 'returns', label: 'Returns', href: '/admin-panel/orders/returns' }
    ]
  },
  { type: 'divider' },
  {
    id: 'financial',
    label: 'Financial',
    icon: 'BanknotesIcon',
    children: [
      { id: 'overview', label: 'Overview', href: '/admin-panel/financial' },
      { id: 'payouts', label: 'Vendor Payouts', href: '/admin-panel/financial/payouts' },
      { id: 'escrow', label: 'Escrow Management', href: '/admin-panel/financial/escrow' },
      { id: 'transactions', label: 'Transactions', href: '/admin-panel/financial/transactions' }
    ]
  },
  {
    id: 'disputes',
    label: 'Disputes',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/admin-panel/disputes',
    badge: 'disputes'
  },
  {
    id: 'support',
    label: 'Support',
    icon: 'LifebuoyIcon',
    children: [
      { id: 'tickets', label: 'Support Tickets', href: '/admin-panel/support' },
      { id: 'reviews', label: 'Review Moderation', href: '/admin-panel/support/reviews' }
    ]
  },
  { type: 'divider' },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'ChartBarIcon',
    href: '/admin-panel/analytics'
  },
  {
    id: 'system',
    label: 'System',
    icon: 'ServerIcon',
    children: [
      { id: 'monitoring', label: 'System Monitoring', href: '/admin-panel/system/monitoring' },
      { id: 'notifications', label: 'Notification Templates', href: '/admin-panel/system/notifications' },
      { id: 'settings', label: 'Settings', href: '/admin-panel/system/settings' }
    ]
  }
];

export default function DashboardSidebar({ 
  role = 'buyer', 
  isOpen, 
  onClose,
  isCollapsed,
  onToggleCollapse,
  badges = {}
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState([]);

  // Get nav items based on role
  const navItems = role === 'vendor' 
    ? VENDOR_NAV_ITEMS 
    : role === 'admin' 
    ? ADMIN_NAV_ITEMS 
    : BUYER_NAV_ITEMS;

  // Check if a path is active
  const isActive = (href, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Toggle expanded submenu
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Auto-expand items with active children
  useEffect(() => {
    navItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => isActive(child.href));
        if (hasActiveChild && !expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
      }
    });
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/user-login';
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const roleLabels = {
    vendor: 'Vendor Dashboard',
    buyer: 'My Account',
    admin: 'Admin Panel'
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <AppImage 
                  src="/logo.png" 
                  alt="Blinno" 
                  width={isCollapsed ? 40 : 120} 
                  height={40} 
                  className="h-10 w-auto object-contain"
                />
                {!isCollapsed && (
                  <span className="text-lg font-bold text-foreground sr-only">Blinno</span>
                )}
              </Link>
              
              {/* Mobile close button */}
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-lg lg:hidden"
              >
                <Icon name="XMarkIcon" size={20} className="text-foreground" />
              </button>

              {/* Desktop collapse button */}
              <button 
                onClick={onToggleCollapse}
                className="hidden lg:block p-1.5 hover:bg-muted rounded-lg"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Icon 
                  name={isCollapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} 
                  size={18} 
                  className="text-muted-foreground" 
                />
              </button>
            </div>
            
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground mt-2">{roleLabels[role]}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {navItems.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                    <li key={`divider-${index}`} className="my-3">
                      <hr className="border-border" />
                    </li>
                  );
                }

                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.id);
                const itemActive = hasChildren 
                  ? item.children.some(child => isActive(child.href))
                  : isActive(item.href, item.exact);
                const badgeCount = item.badge ? badges[item.badge] : 0;

                return (
                  <li key={item.id}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            transition-colors text-left
                            ${itemActive 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground hover:bg-muted'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                          `}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <Icon 
                            name={item.icon} 
                            size={20} 
                            className={itemActive ? 'text-primary' : 'text-muted-foreground'}
                          />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-sm font-medium">{item.label}</span>
                              <Icon 
                                name={isExpanded ? 'ChevronDownIcon' : 'ChevronRightIcon'} 
                                size={16} 
                                className="text-muted-foreground"
                              />
                            </>
                          )}
                        </button>
                        
                        {!isCollapsed && isExpanded && (
                          <ul className="mt-1 ml-4 pl-4 border-l border-border space-y-1">
                            {item.children.map(child => (
                              <li key={child.id}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                    transition-colors
                                    ${isActive(child.href)
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }
                                  `}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-colors relative
                          ${itemActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-foreground hover:bg-muted'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon 
                          name={item.icon} 
                          size={20} 
                          className={itemActive ? 'text-primary' : 'text-muted-foreground'}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium">{item.label}</span>
                            {badgeCount > 0 && (
                              <span className="px-2 py-0.5 bg-error text-white text-xs font-bold rounded-full">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            )}
                          </>
                        )}
                        {isCollapsed && badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {badgeCount > 9 ? '9+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className={`p-3 border-t border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSignOut}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg
                text-error hover:bg-error/10 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Sign Out' : undefined}
            >
              <Icon name="ArrowRightOnRectangleIcon" size={20} />
              {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

DashboardSidebar.propTypes = {
  role: PropTypes.oneOf(['vendor', 'buyer', 'admin']),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  badges: PropTypes.object
};


'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function UserAccountDropdown({ user = null, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDashboardLink = () => {
    if (!user) return '/user-login';
    if (user?.role === 'admin') return '/admin-panel';
    if (user?.role === 'vendor') return '/vendor-dashboard';
    return '/buyer-dashboard';
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/user-login"
          className="hidden sm:block px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          href="/user-registration"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200 shadow-card"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors duration-200 group"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
          <span className="text-primary-foreground text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
          {user?.role && (
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          )}
        </div>
        <Icon 
          name="ChevronDownIcon" 
          size={16} 
          className={`text-muted-foreground hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-dropdown py-2 z-[150] animate-fade-in">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {user?.role && (
              <span className="inline-block mt-2 px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md capitalize font-medium">
                {user?.role} Account
              </span>
            )}
          </div>

          <div className="py-1">
            <Link
              href={getDashboardLink()}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
              onClick={closeDropdown}
            >
              <Icon name="ChartBarIcon" size={18} className="text-muted-foreground" />
              <span>Dashboard</span>
            </Link>

            {user?.role === 'vendor' && (
              <Link
                href="/vendor-store-management"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                onClick={closeDropdown}
              >
                <Icon name="BuildingStorefrontIcon" size={18} className="text-muted-foreground" />
                <span>Store Management</span>
              </Link>
            )}

            <Link
              href="/order-tracking"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
              onClick={closeDropdown}
            >
              <Icon name="ClipboardDocumentListIcon" size={18} className="text-muted-foreground" />
              <span>My Orders</span>
            </Link>
          </div>

          <div className="border-t border-border pt-1">
            <button
              onClick={() => {
                closeDropdown();
                onLogout?.();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-200"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
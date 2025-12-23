'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import AppImage from '../ui/AppImage';
import AppIcon from '../ui/AppIcon';
import SearchIntegration from './SearchIntegration';
import ShoppingCartBadge from './ShoppingCartBadge';

import MobileMenuOverlay from './MobileMenuOverlay';

export default function Header({ className = '' }) {
  const { user, userProfile, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      // Use hard redirect to ensure full page reload and clear all cached state
      window.location.href = '/user-login';
    } catch (err) {
      console.error('Logout error:', err);
      // Still redirect even if there's an error
      window.location.href = '/user-login';
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <AppImage
              src="/logo.png"
              alt="Blinno Marketplace"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
            <span className="text-xl font-bold text-gray-900">Blinno</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/product-catalog"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/deals"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Deals
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-6">
            <SearchIntegration />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Shopping Cart */}
            <ShoppingCartBadge />

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {userProfile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {userProfile?.full_name || user?.email?.split('@')?.[0] || 'User'}
                  </span>
                  <AppIcon
                    name="chevron-down"
                    className="w-4 h-4 text-gray-500"
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile?.full_name || user?.email?.split('@')?.[0]}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1 capitalize">
                        {userProfile?.role || 'buyer'}
                      </p>
                    </div>
                    <Link
                      href={
                        userProfile?.role === 'admin' ?'/admin-panel'
                          : userProfile?.role === 'vendor' ?'/vendor-dashboard' :'/buyer-dashboard'
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/user-login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/user-registration"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <AppIcon name="menu" className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenuOverlay
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          userProfile={userProfile}
          onLogout={handleLogout}
        />
      )}
      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
}

Header.propTypes = {
  className: PropTypes?.string,
};
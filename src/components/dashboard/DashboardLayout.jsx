'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import Icon from '@/components/ui/AppIcon';

export default function DashboardLayout({ 
  children, 
  role = 'buyer',
  title,
  subtitle,
  actions,
  badges = {}
}) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state
  const toggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Auth check
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/user-login');
      return;
    }

    // Role check
    const userRole = user?.user_metadata?.role || 'buyer';
    
    if (role === 'vendor' && userRole !== 'vendor') {
      if (userRole === 'admin') {
        router.push('/admin-panel');
      } else {
        router.push('/buyer-dashboard');
      }
    } else if (role === 'admin' && userRole !== 'admin') {
      if (userRole === 'vendor') {
        router.push('/vendor-dashboard');
      } else {
        router.push('/buyer-dashboard');
      }
    } else if (role === 'buyer' && userRole !== 'buyer') {
      if (userRole === 'vendor') {
        router.push('/vendor-dashboard');
      } else if (userRole === 'admin') {
        router.push('/admin-panel');
      }
    }
  }, [loading, isAuthenticated, user, router, role]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar */}
      <DashboardSidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        badges={badges}
      />

      {/* Main content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        {/* Top header bar */}
        <header className="sticky top-0 z-60 bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            {/* Left side - mobile menu + title */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-lg lg:hidden"
              >
                <Icon name="Bars3Icon" size={24} className="text-foreground" />
              </button>

              {/* Page title */}
              {title && (
                <div>
                  <h1 className="text-lg sm:text-xl font-heading font-bold text-foreground">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right side - actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {actions}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-background relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.oneOf(['vendor', 'buyer', 'admin']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  badges: PropTypes.object
};


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';


export default function LoginForm({ className = '' }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target || {};
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const redirectToDashboard = (role) => {
    const dashboardRoutes = {
      admin: '/admin-panel',
      vendor: '/vendor-dashboard',
      buyer: '/buyer-dashboard',
    };
    const targetRoute = dashboardRoutes[role] || dashboardRoutes.buyer;
    router.push(targetRoute);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error: signInError } = await signIn(
        formData?.email,
        formData?.password
      );

      if (signInError) {
        setError(signInError?.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        setSuccessMessage('Login successful! Redirecting...');
        const role = data.user.user_metadata?.role || 'buyer';
        setTimeout(() => {
          redirectToDashboard(role);
        }, 500);
      } else {
        setError('Login failed. No user data returned.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password, rememberMe: false });
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError?.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        setSuccessMessage('Login successful! Redirecting...');
        const role = data.user.user_metadata?.role || 'buyer';
        setTimeout(() => {
          redirectToDashboard(role);
        }, 500);
      } else {
        setError('Login failed. No user data returned.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={() => navigator?.clipboard?.writeText(error)}
              className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
            >
              Copy error details
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Demo Credentials Section */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">
          Demo Credentials - Click to Login
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('buyer@blinno.com', 'Buyer@123')}
            disabled={loading}
            className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-900">Buyer Account</p>
                <p className="text-xs text-blue-700">buyer@blinno.com / Buyer@123</p>
              </div>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('vendor@blinno.com', 'Vendor@123')}
            disabled={loading}
            className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-900">Vendor Account</p>
                <p className="text-xs text-blue-700">vendor@blinno.com / Vendor@123</p>
              </div>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin@blinno.com', 'Admin@123')}
            disabled={loading}
            className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-900">Admin Account</p>
                <p className="text-xs text-blue-700">admin@blinno.com / Admin@123</p>
              </div>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email or Phone Number
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData?.email}
              onChange={handleChange}
              placeholder="buyer@blinno.com or +255712345678"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData?.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData?.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

LoginForm.propTypes = {
  className: PropTypes?.string
};
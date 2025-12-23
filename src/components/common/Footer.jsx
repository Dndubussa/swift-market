'use client';
import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import AppIcon from '../ui/AppIcon';
import AppImage from '../ui/AppImage';

export default function Footer({ className = '' }) {
  const currentYear = new Date()?.getFullYear();

  const footerLinks = {
    about: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press & Media', href: '/press' },
      { label: 'Sustainability', href: '/sustainability' },
    ],
    quickLinks: [
      { label: 'Sell on Blinno', href: '/vendor-registration' },
      { label: 'Product Catalog', href: '/product-catalog' },
      { label: 'Deals & Offers', href: '/deals' },
      { label: 'Track Order', href: '/order-tracking' },
    ],
    support: [
      { label: 'Help Center', href: '/support' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping & Delivery', href: '/shipping-info' },
      { label: 'Returns & Refunds', href: '/returns' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Security', href: '/security' },
    ],
  };

  const socialLinks = [
    { name: 'facebook', href: 'https://facebook.com/blinno', label: 'Facebook' },
    { name: 'twitter', href: 'https://twitter.com/blinno', label: 'Twitter' },
    { name: 'instagram', href: 'https://instagram.com/blinno', label: 'Instagram' },
    { name: 'linkedin', href: 'https://linkedin.com/company/blinno', label: 'LinkedIn' },
  ];

  const paymentMethods = [
    { name: 'M-Pesa', image: '/assets/images/Payment Methods/mpesa.png', size: 'h-12' },
    { name: 'Airtel Money', image: '/assets/images/Payment Methods/airtel-money.png', size: 'h-12' },
    { name: 'HaloPesa', image: '/assets/images/Payment Methods/halopesa.png', size: 'h-6' },
    { name: 'Mixx by YAS', image: '/assets/images/Payment Methods/mixx-by-yas.png', size: 'h-12' },
    { name: 'Visa', image: '/assets/images/Payment Methods/visa.png', size: 'h-6' },
    { name: 'Mastercard', image: '/assets/images/Payment Methods/mastercard.png', size: 'h-8' },
  ];

  return (
    <footer className={`bg-gray-900 text-gray-300 ${className}`}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <AppImage
                src="/logo.png"
                alt="Blinno Marketplace"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
              />
              <span className="text-xl font-bold text-white">Blinno</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              Tanzania's trusted marketplace connecting buyers and vendors for seamless online shopping experiences.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks?.map((social) => (
                <a
                  key={social?.name}
                  href={social?.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social?.label}
                >
                  <AppIcon name={social?.name} className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">About Blinno</h3>
            <ul className="space-y-2">
              {footerLinks?.about?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks?.quickLinks?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-2">
              {footerLinks?.support?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks?.legal?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <h4 className="text-white font-semibold mb-4">Accepted Payment Methods</h4>
          <div className="flex flex-wrap gap-3">
            {paymentMethods?.map((method) => (
              <div
                key={method?.name}
                className="px-4 py-2 bg-white rounded-lg flex items-center justify-center"
              >
                <AppImage
                  src={method?.image}
                  alt={method?.name}
                  width={120}
                  height={60}
                  className={`${method?.size} w-auto object-contain`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Blinno Marketplace. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <AppIcon name="globe" className="w-4 h-4" />
                Tanzania
              </span>
              <span className="flex items-center gap-2">
                <AppIcon name="shield-check" className="w-4 h-4" />
                Secure Shopping
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  className: PropTypes?.string,
};
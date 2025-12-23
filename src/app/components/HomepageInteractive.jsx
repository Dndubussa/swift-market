'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AppImage from '@/components/ui/AppImage';
import AppIcon from '@/components/ui/AppIcon';

// Hero Section Component
function HeroSection() {
  const headlines = [
    { title: 'Discover Authentic Tanzanian Products', subtitle: 'From local artisans to your doorstep' },
    { title: 'Shop with Confidence', subtitle: 'Secure payments with M-Pesa & Tigo Pesa' },
    { title: 'Support Local Vendors', subtitle: 'Empowering businesses across Tanzania' },
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-[#1a365d] via-[#2B5AA3] to-[#4A90E2] overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F5A623] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 border border-white/20 rounded-full" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 border border-white/10 rounded-full" />
        <svg className="absolute bottom-0 left-0 w-full h-24 text-white" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,96L48,90.7C96,85,192,75,288,80C384,85,480,107,576,112C672,117,768,107,864,90.7C960,75,1056,53,1152,48C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[500px]">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="w-2 h-2 bg-[#F5A623] rounded-full animate-pulse" />
              <span className="text-sm font-medium">Tanzania&apos;s Leading Marketplace</span>
            </div>
            
            <div className="space-y-4 min-h-[160px]">
              <h1 
                key={currentSlide}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in"
              >
                {headlines[currentSlide].title}
              </h1>
              <p className="text-xl text-white/80 max-w-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {headlines[currentSlide].subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/product-catalog"
                className="group inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#e09000] text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Shopping
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/user-registration?role=vendor"
                className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/30 transition-all duration-300"
              >
                Become a Vendor
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <span className="text-sm">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Product Cards */}
          <div className="hidden lg:block relative h-[500px]">
            <div className="absolute top-0 right-0 w-64 bg-white rounded-2xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-float">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-3 overflow-hidden">
                <AppImage 
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" 
                  alt="Featured Product"
                  className="w-full h-full object-cover"
                  width={256}
                  height={256}
                />
              </div>
              <p className="font-semibold text-gray-900">Smart Watch Pro</p>
              <p className="text-[#2B5AA3] font-bold">TZS 450,000</p>
            </div>
            
            <div className="absolute top-32 left-0 w-56 bg-white rounded-2xl shadow-2xl p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-3 overflow-hidden">
                <AppImage 
                  src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400" 
                  alt="Featured Product"
                  className="w-full h-full object-cover"
                  width={224}
                  height={224}
                />
              </div>
              <p className="font-semibold text-gray-900">Handmade Basket</p>
              <p className="text-[#2B5AA3] font-bold">TZS 35,000</p>
            </div>
            
            <div className="absolute bottom-0 right-20 w-60 bg-white rounded-2xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '1s' }}>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-3 overflow-hidden">
                <AppImage 
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400" 
                  alt="Featured Product"
                  className="w-full h-full object-cover"
                  width={240}
                  height={240}
                />
              </div>
              <p className="font-semibold text-gray-900">African Print Dress</p>
              <p className="text-[#2B5AA3] font-bold">TZS 85,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {headlines.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx ? 'w-8 bg-[#F5A623]' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// Categories Section
function CategoriesSection({ categories }) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of categories featuring authentic Tanzanian products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/product-catalog?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#2B5AA3]/0 to-[#2B5AA3]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#2B5AA3] transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{category.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Products Section
function FeaturedProductsSection({ products }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Trending Now
            </h2>
            <p className="text-gray-600">Discover what&apos;s popular in Tanzania</p>
          </div>
          <Link
            href="/product-catalog?featured=true"
            className="hidden md:inline-flex items-center gap-2 text-[#2B5AA3] hover:text-[#1E4278] font-semibold transition-colors"
          >
            View All
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/product-details?id=${product.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <AppImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  width={400}
                  height={400}
                />
                {product.discount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    -{product.discount}%
                  </span>
                )}
                {product.isNew && (
                  <span className="absolute top-3 right-3 bg-[#2B5AA3] text-white text-xs font-bold px-2 py-1 rounded-lg">
                    NEW
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Quick View
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-[#2B5AA3] font-medium mb-1">{product.category}</p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2B5AA3] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-[#F5A623]">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < product.rating ? 'fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#2B5AA3]">
                    TZS {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      TZS {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/product-catalog?featured=true"
            className="inline-flex items-center gap-2 bg-[#2B5AA3] hover:bg-[#1E4278] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            View All Products
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Why Choose Us Section
function WhyChooseUsSection() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Pay safely with M-Pesa, Tigo Pesa, or card. Your transactions are protected.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Nationwide Delivery',
      description: 'We deliver across Tanzania. Track your orders in real-time.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Best Prices',
      description: 'Competitive prices from verified local vendors. Great deals daily.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Our support team is always ready to help via chat, phone, or email.',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#2B5AA3]/10 text-[#2B5AA3] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Why Choose Blinno
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shopping Made Easy & Secure
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We&apos;re committed to providing the best shopping experience for Tanzanians
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Vendor Spotlight Section
function VendorSpotlightSection({ vendors }) {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#F5A623]/20 text-[#e09000] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Top Sellers
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Vendors
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover trusted sellers with high-quality products and excellent service
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="h-32 bg-gradient-to-br from-[#2B5AA3] to-[#4A90E2] relative">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')]" />
                {vendor.tier && (
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    vendor.tier === 'diamond' ? 'bg-cyan-100 text-cyan-800' :
                    vendor.tier === 'platinum' ? 'bg-gray-100 text-gray-800' :
                    vendor.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {vendor.tier.charAt(0).toUpperCase() + vendor.tier.slice(1)} Seller
                  </span>
                )}
              </div>
              <div className="relative px-6 pb-6">
                <div className="absolute -top-10 left-6">
                  <div className="w-20 h-20 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white">
                    <AppImage
                      src={vendor.logo}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
                <div className="pt-12">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{vendor.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{vendor.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-[#F5A623] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{vendor.rating}</span>
                      <span className="text-gray-500 text-sm">({vendor.reviews} reviews)</span>
                    </div>
                    <span className="text-sm text-gray-500">{vendor.products} products</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/user-registration?role=vendor"
            className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#e09000] text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            Start Selling on Blinno
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Payment Methods Section
function PaymentMethodsSection() {
  const paymentMethods = [
    { name: 'M-Pesa', image: '/assets/images/Payment Methods/mpesa.png', size: 'h-12' },
    { name: 'Airtel Money', image: '/assets/images/Payment Methods/airtel-money.png', size: 'h-12' },
    { name: 'HaloPesa', image: '/assets/images/Payment Methods/halopesa.png', size: 'h-6' },
    { name: 'Mixx by YAS', image: '/assets/images/Payment Methods/mixx-by-yas.png', size: 'h-12' },
    { name: 'Visa', image: '/assets/images/Payment Methods/visa.png', size: 'h-6' },
    { name: 'Mastercard', image: '/assets/images/Payment Methods/mastercard.png', size: 'h-8' },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Payment Methods</h3>
            <p className="text-gray-600">Pay securely with your preferred method</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {paymentMethods.map((method) => (
              <div 
                key={method.name}
                className="flex items-center justify-center bg-gray-50 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <AppImage
                  src={method.image}
                  alt={method.name}
                  width={120}
                  height={60}
                  className={`${method.size} w-auto object-contain`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Newsletter Section
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#2B5AA3] to-[#1a365d] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5A623] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with Blinno
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Subscribe to get exclusive deals, new arrivals, and special offers delivered to your inbox
          </p>

          {isSubscribed ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank You for Subscribing!</h3>
              <p className="text-white/80">You&apos;ll receive our best deals and updates soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-[#F5A623] hover:bg-[#e09000] text-gray-900 font-semibold rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>
          )}

          <p className="text-white/60 text-sm mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  const stats = [
    { value: '10K+', label: 'Active Buyers' },
    { value: '1,500+', label: 'Verified Vendors' },
    { value: '50K+', label: 'Products Listed' },
    { value: '99.9%', label: 'Secure Transactions' },
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#F5A623] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default function HomepageInteractive({ initialData }) {
  const { user, userProfile, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Categories */}
      <CategoriesSection categories={initialData.categories} />
      
      {/* Featured Products */}
      <FeaturedProductsSection products={initialData.featuredProducts} />
      
      {/* Why Choose Us */}
      <WhyChooseUsSection />
      
      {/* Stats */}
      <StatsSection />
      
      {/* Vendor Spotlight */}
      <VendorSpotlightSection vendors={initialData.vendors} />
      
      {/* Payment Methods */}
      <PaymentMethodsSection />
      
      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}


'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import RegistrationForm from './RegistrationForm';
import SocialLoginButtons from './SocialLoginButtons';
import RegistrationBenefits from './RegistrationBenefits';

export default function UserRegistrationInteractive({ initialData }) {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegistrationSuccess = (userData) => {
    setRegistrationSuccess(true);
    console.log('Registration successful:', userData);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Centered Logo */}
        <div className="flex justify-center items-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <AppImage
              src="/logo.png"
              alt="Blinno Marketplace"
              width={160}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
            <span className="text-2xl font-bold text-gray-900">Blinno</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Join thousands of buyers and sellers on Tanzania's leading marketplace
              </p>
            </div>

            {/* Social Login Options */}
            <div className="mb-8">
              <SocialLoginButtons onSocialLogin={handleSocialLogin} />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">Or register with email</span>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/user-login" className="text-primary font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column - Benefits */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <RegistrationBenefits />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

UserRegistrationInteractive.propTypes = {
  initialData: PropTypes?.shape({
    specialOffer: PropTypes?.string,
    benefits: PropTypes?.arrayOf(PropTypes?.shape({
      icon: PropTypes?.string,
      title: PropTypes?.string,
      description: PropTypes?.string
    }))
  })
};
'use client';

import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import TierCard from './TierCard';
import TierProgressBar from './TierProgressBar';
import BenefitsSection from './BenefitsSection';
import RequirementsSection from './RequirementsSection';
import Header from '@/components/common/Header';

export default function SellerTiersInteractive() {
  const [currentTier, setCurrentTier] = useState('bronze');
  const [tierData, setTierData] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('bronze');

  const tiers = [
    { id: 'bronze', name: 'Bronze', color: 'bg-amber-700', icon: '🥉' },
    { id: 'silver', name: 'Silver', color: 'bg-gray-400', icon: '🥈' },
    { id: 'gold', name: 'Gold', color: 'bg-yellow-500', icon: '🥇' },
    { id: 'platinum', name: 'Platinum', color: 'bg-gray-300', icon: '💎' },
    { id: 'diamond', name: 'Diamond', color: 'bg-cyan-400', icon: '💠' }
  ];

  useEffect(() => {
    fetchSellerTierData();
    fetchBenefitsAndRequirements();
  }, []);

  useEffect(() => {
    if (selectedTier) {
      fetchBenefitsAndRequirements();
    }
  }, [selectedTier]);

  const fetchSellerTierData = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (user) {
        const { data: vendorProfile } = await supabase?.from('vendor_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

        if (vendorProfile) {
          const { data: gradeData } = await supabase?.from('seller_grades')?.select('*')?.eq('vendor_id', vendorProfile?.id)?.single();

          if (gradeData) {
            setCurrentTier(gradeData?.tier);
            setSelectedTier(gradeData?.tier);
            setTierData(gradeData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBenefitsAndRequirements = async () => {
    try {
      const { data: benefitsData } = await supabase?.from('tier_benefits')?.select('*')?.eq('tier', selectedTier)?.eq('is_active', true)?.order('display_order');

      const { data: requirementsData } = await supabase?.from('tier_requirements')?.select('*')?.eq('tier', selectedTier)?.order('display_order');

      setBenefits(benefitsData || []);
      setRequirements(requirementsData || []);
    } catch (error) {
      console.error('Error fetching benefits and requirements:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tier information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              Seller Tier Program
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Grow your business and unlock exclusive benefits as you advance through our seller tiers
            </p>
          </div>

          {/* Current Tier Display */}
          {tierData && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {tiers?.find(t => t?.id === currentTier)?.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                      Your Current Tier: {tiers?.find(t => t?.id === currentTier)?.name}
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                      Member since {new Date(tierData?.tier_achieved_at)?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Rating</p>
                    <p className="text-xl font-bold text-[var(--color-primary)]">
                      {tierData?.average_rating?.toFixed(1) || '0.0'}⭐
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Disputes</p>
                    <p className="text-xl font-bold text-[var(--color-primary)]">
                      {tierData?.dispute_rate?.toFixed(1) || '0'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Returns</p>
                    <p className="text-xl font-bold text-[var(--color-primary)]">
                      {tierData?.return_rate?.toFixed(1) || '0'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Compliance</p>
                    <p className="text-xl font-bold text-[var(--color-primary)]">
                      {tierData?.payment_compliance_rate?.toFixed(0) || '100'}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress to next tier */}
              <TierProgressBar 
                currentTier={currentTier}
                tiers={tiers}
                tierData={tierData}
              />
            </div>
          )}
        </div>

        {/* Tier Cards */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
            All Seller Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {tiers?.map((tier) => (
              <TierCard
                key={tier?.id}
                tier={tier}
                isCurrentTier={tier?.id === currentTier}
                isSelected={tier?.id === selectedTier}
                onClick={() => setSelectedTier(tier?.id)}
              />
            ))}
          </div>
        </div>

        {/* Benefits and Requirements */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BenefitsSection 
            tierName={tiers?.find(t => t?.id === selectedTier)?.name}
            benefits={benefits}
          />
          <RequirementsSection 
            tierName={tiers?.find(t => t?.id === selectedTier)?.name}
            requirements={requirements}
            tierData={tierData}
          />
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Advance?</h2>
          <p className="text-lg mb-6">
            Keep delivering excellent service to unlock higher tiers and exclusive benefits
          </p>
          <button className="bg-white text-[var(--color-primary)] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            View Your Performance Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
'use client';

import PropTypes from 'prop-types';

export default function TierProgressBar({ currentTier, tiers, tierData }) {
  const currentTierIndex = tiers?.findIndex(t => t?.id === currentTier) || 0;
  const nextTier = tiers?.[currentTierIndex + 1];
  const progress = tierData?.current_points && tierData?.points_to_next_tier 
    ? (tierData?.current_points / tierData?.points_to_next_tier) * 100 
    : 0;

  if (currentTierIndex === tiers?.length - 1) {
    return (
      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
        <p className="text-center text-[var(--color-text-primary)] font-semibold">
          🎉 Congratulations! You have reached the highest tier!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          Progress to {nextTier?.name}
        </span>
        <span className="text-sm font-bold text-[var(--color-primary)]">
          {tierData?.current_points || 0} / {tierData?.points_to_next_tier || 100} points
        </span>
      </div>
      
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
        
        {progress >= 50 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {Math.round(progress)}%
          </div>
        )}
      </div>
      
      {progress < 100 && (
        <p className="mt-2 text-xs text-[var(--color-text-secondary)] text-center">
          Keep up the great work! You are {Math.round(100 - progress)}% away from {nextTier?.name} tier
        </p>
      )}
    </div>
  );
}

TierProgressBar.propTypes = {
  currentTier: PropTypes?.string?.isRequired,
  tiers: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired
  }))?.isRequired,
  tierData: PropTypes?.shape({
    current_points: PropTypes?.number,
    points_to_next_tier: PropTypes?.number
  })
};
'use client';

import PropTypes from 'prop-types';

export default function TierCard({ tier, isCurrentTier, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-lg p-6 text-center transition-all duration-300 transform hover:scale-105
        ${isSelected ? 'ring-4 ring-[var(--color-primary)] shadow-2xl' : 'shadow-md hover:shadow-xl'}
        ${isCurrentTier ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'}
      `}
    >
      {isCurrentTier && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-xs font-bold">
          Your Tier
        </div>
      )}
      
      <div className="text-5xl mb-4">{tier?.icon}</div>
      
      <h3 className={`text-xl font-bold mb-2 ${tier?.color?.replace('bg-', 'text-')}`}>
        {tier?.name}
      </h3>
      
      <div className={`w-12 h-1 ${tier?.color} mx-auto rounded-full`}></div>
      
      {isCurrentTier && (
        <div className="mt-4 text-sm text-[var(--color-primary)] font-semibold">
          Current Level
        </div>
      )}
    </div>
  );
}

TierCard.propTypes = {
  tier: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    color: PropTypes?.string?.isRequired,
    icon: PropTypes?.string?.isRequired
  })?.isRequired,
  isCurrentTier: PropTypes?.bool?.isRequired,
  isSelected: PropTypes?.bool?.isRequired,
  onClick: PropTypes?.func?.isRequired
};
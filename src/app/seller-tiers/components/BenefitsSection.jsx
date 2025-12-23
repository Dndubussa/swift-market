'use client';

import PropTypes from 'prop-types';

export default function BenefitsSection({ tierName, benefits }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        {tierName} Benefits
      </h3>
      {benefits?.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          No benefits information available
        </p>
      ) : (
        <div className="space-y-4">
          {benefits?.map((benefit) => (
            <div 
              key={benefit?.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl flex-shrink-0">
                {benefit?.benefit_icon || '✓'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                  {benefit?.benefit_name}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {benefit?.benefit_description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

BenefitsSection.propTypes = {
  tierName: PropTypes?.string?.isRequired,
  benefits: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    benefit_name: PropTypes?.string?.isRequired,
    benefit_description: PropTypes?.string?.isRequired,
    benefit_icon: PropTypes?.string
  }))?.isRequired
};
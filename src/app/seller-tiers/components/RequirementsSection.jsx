'use client';

import PropTypes from 'prop-types';

export default function RequirementsSection({ tierName, requirements, tierData }) {
  const getRequirementStatus = (requirement) => {
    if (!tierData) return { met: false, progress: 0 };
    
    const currentValue = {
      'sales': tierData?.total_sales / 1000, // Convert to thousands
      'rating': tierData?.average_rating,
      'dispute_rate': tierData?.dispute_rate,
      'return_rate': tierData?.return_rate,
      'payment_compliance': tierData?.payment_compliance_rate
    }?.[requirement?.requirement_type] || 0;

    const targetValue = requirement?.requirement_value;
    
    // For rates, lower is better
    const isInverseMetric = ['dispute_rate', 'return_rate']?.includes(requirement?.requirement_type);
    
    let met;
    let progress;
    
    if (isInverseMetric) {
      met = currentValue <= targetValue;
      progress = Math.max(0, Math.min(100, ((targetValue - currentValue) / targetValue) * 100));
    } else {
      met = currentValue >= targetValue;
      progress = Math.min(100, (currentValue / targetValue) * 100);
    }
    
    return { met, progress, currentValue, targetValue };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        {tierName} Requirements
      </h3>
      {requirements?.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          No requirements information available
        </p>
      ) : (
        <div className="space-y-4">
          {requirements?.map((requirement) => {
            const status = getRequirementStatus(requirement);
            
            return (
              <div 
                key={requirement?.id}
                className="p-4 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                      {requirement?.requirement_name}
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {requirement?.requirement_description}
                    </p>
                  </div>
                  <div className={`
                    ml-4 px-3 py-1 rounded-full text-xs font-bold
                    ${status?.met ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}
                  `}>
                    {status?.met ? '✓ Met' : 'In Progress'}
                  </div>
                </div>
                {tierData && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                      <span>Current: {status?.currentValue?.toFixed(1)}</span>
                      <span>Target: {status?.targetValue}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          status?.met ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(status?.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

RequirementsSection.propTypes = {
  tierName: PropTypes?.string?.isRequired,
  requirements: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    requirement_name: PropTypes?.string?.isRequired,
    requirement_description: PropTypes?.string?.isRequired,
    requirement_value: PropTypes?.number?.isRequired,
    requirement_type: PropTypes?.string?.isRequired
  }))?.isRequired,
  tierData: PropTypes?.shape({
    total_sales: PropTypes?.number,
    average_rating: PropTypes?.number,
    dispute_rate: PropTypes?.number,
    return_rate: PropTypes?.number,
    payment_compliance_rate: PropTypes?.number
  })
};
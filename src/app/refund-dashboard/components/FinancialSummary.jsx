'use client';

import PropTypes from 'prop-types';

export default function FinancialSummary({ summary }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    })?.format(amount || 0);
  };

  const cards = [
    {
      title: 'Total Pending',
      amount: summary?.totalPending,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Total Processed',
      amount: summary?.totalProcessed,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Dispute Refunds',
      amount: summary?.totalDisputes,
      isCount: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Return Refunds',
      amount: summary?.totalReturns,
      isCount: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards?.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card?.color} bg-opacity-10`}>
              <div className={card?.textColor}>
                {card?.icon}
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{card?.title}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {card?.isCount ? card?.amount : formatAmount(card?.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}

FinancialSummary.propTypes = {
  summary: PropTypes?.shape({
    totalPending: PropTypes?.number?.isRequired,
    totalProcessed: PropTypes?.number?.isRequired,
    totalDisputes: PropTypes?.number?.isRequired,
    totalReturns: PropTypes?.number?.isRequired,
    outstandingBalance: PropTypes?.number?.isRequired
  })?.isRequired
};
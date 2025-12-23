'use client';

import PropTypes from 'prop-types';

export default function PaymentStatusTracker({ payments }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
        estimate: '1-2 hours'
      },
      processing: {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800',
        icon: '⚡',
        estimate: '2-4 hours'
      },
      refund_pending: {
        label: 'Refund Pending',
        color: 'bg-orange-100 text-orange-800',
        icon: '💰',
        estimate: '1-3 business days'
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        icon: '✓',
        estimate: 'Completed'
      }
    };
    return statusMap?.[status] || statusMap?.pending;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      mobile_money: '📱',
      bank_transfer: '🏦',
      card: '💳',
      clickpesa: '💳'
    };
    return icons?.[method] || '💰';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Payment Status Tracking</h2>
        <p className="mt-1 text-sm text-gray-500">
          Real-time updates from ClickPesa and payment processors
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {payments?.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2 text-sm">No payments being processed</p>
          </div>
        ) : (
          payments?.map((payment) => {
            const statusInfo = getStatusInfo(payment?.payment_status);
            return (
              <div key={payment?.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getPaymentMethodIcon(payment?.payment_method)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment?.payment_method?.replace('_', ' ')?.toUpperCase() || 'Payment'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Transaction ID: {payment?.transaction_id || 'Pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatAmount(payment?.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Initiated</p>
                        <p className="text-sm text-gray-900">{formatDate(payment?.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Estimated Completion</p>
                        <p className="text-sm text-gray-900">{statusInfo?.estimate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo?.color} flex items-center gap-1`}>
                      <span>{statusInfo?.icon}</span>
                      {statusInfo?.label}
                    </span>
                    
                    {/* Progress indicator */}
                    <div className="mt-3 w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            payment?.payment_status === 'completed' ? 'bg-green-500' :
                            payment?.payment_status === 'processing'? 'bg-blue-500' : 'bg-yellow-500'
                          } transition-all duration-500`}
                          style={{
                            width: payment?.payment_status === 'completed' ? '100%' :
                                   payment?.payment_status === 'processing' ? '66%' :
                                   payment?.payment_status === 'refund_pending' ? '33%' : '10%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

PaymentStatusTracker.propTypes = {
  payments: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    amount: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])?.isRequired,
    payment_method: PropTypes?.string,
    payment_status: PropTypes?.string?.isRequired,
    transaction_id: PropTypes?.string,
    created_at: PropTypes?.string?.isRequired
  }))?.isRequired
};
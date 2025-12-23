'use client';
import PropTypes from 'prop-types';
import Link from 'next/link';

export default function TicketCard({ ticket }) {
  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors?.[priority] || 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Link href={`/support/tickets/${ticket?.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-mono text-gray-500">
                {ticket?.ticketNumber}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket?.status)}`}>
                {ticket?.status?.replace('_', ' ')}
              </span>
              <span className={`text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                {ticket?.priority?.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {ticket?.subject}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {ticket?.description}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {ticket?.category?.replace('_', ' ')}
            </span>
            {ticket?.order && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order #{ticket?.order?.orderNumber}
              </span>
            )}
          </div>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(ticket?.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

TicketCard.propTypes = {
  ticket: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    ticketNumber: PropTypes?.string?.isRequired,
    subject: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    priority: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    createdAt: PropTypes?.string?.isRequired,
    order: PropTypes?.shape({
      orderNumber: PropTypes?.string
    })
  })?.isRequired
};
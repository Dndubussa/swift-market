'use client';
import PropTypes from 'prop-types';

export default function TicketDetails({ ticket }) {
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
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors?.[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Ticket Number */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {ticket?.ticketNumber}
        </h2>
        <p className="text-gray-600">{ticket?.subject}</p>
      </div>

      {/* Status and Priority */}
      <div className="flex flex-wrap gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket?.status)}`}>
          {ticket?.status?.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket?.priority)}`}>
          {ticket?.priority} priority
        </span>
      </div>

      {/* Details */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
          <p className="text-gray-900">{ticket?.category?.replace('_', ' ')}</p>
        </div>

        {ticket?.order && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Related Order</h3>
            <p className="text-gray-900">#{ticket?.order?.orderNumber}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
          <p className="text-gray-900">{formatDate(ticket?.createdAt)}</p>
        </div>

        {ticket?.updatedAt && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-gray-900">{formatDate(ticket?.updatedAt)}</p>
          </div>
        )}

        {ticket?.resolvedAt && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Resolved</h3>
            <p className="text-gray-900">{formatDate(ticket?.resolvedAt)}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{ticket?.description}</p>
      </div>
    </div>
  );
}

TicketDetails.propTypes = {
  ticket: PropTypes?.shape({
    ticketNumber: PropTypes?.string?.isRequired,
    subject: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    priority: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    createdAt: PropTypes?.string?.isRequired,
    updatedAt: PropTypes?.string,
    resolvedAt: PropTypes?.string,
    order: PropTypes?.shape({
      orderNumber: PropTypes?.string
    })
  })?.isRequired
};
'use client';

import PropTypes from 'prop-types';

export default function RefundFilters({ filters, onFilterChange }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Filter Refunds</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Refund Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refund Type
          </label>
          <select
            value={filters?.refundType}
            onChange={(e) => handleFilterChange('refundType', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="dispute">Disputes</option>
            <option value="return">Returns</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters?.status}
            onChange={(e) => handleFilterChange('status', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters?.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Order ID, Customer..."
            value={filters?.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {/* Clear Filters Button */}
      {(filters?.refundType !== 'all' || filters?.status !== 'all' || filters?.dateRange !== 'all' || filters?.searchQuery) && (
        <button
          onClick={() => onFilterChange({
            refundType: 'all',
            status: 'all',
            dateRange: 'all',
            searchQuery: ''
          })}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

RefundFilters.propTypes = {
  filters: PropTypes?.shape({
    refundType: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    dateRange: PropTypes?.string?.isRequired,
    searchQuery: PropTypes?.string?.isRequired
  })?.isRequired,
  onFilterChange: PropTypes?.func?.isRequired
};
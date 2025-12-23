'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { returnService } from '../../lib/services/returnService';
import VendorReturnCard from './components/VendorReturnCard';
import ApproveReturnModal from './components/ApproveReturnModal';
import RejectReturnModal from './components/RejectReturnModal';

export default function VendorReturnsPage() {
  const { user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadReturns();
    }
  }, [user]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const data = await returnService?.getVendorReturns();
      setReturns(data);
    } catch (err) {
      setError(err?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (returnData) => {
    setSelectedReturn(returnData);
    setShowApproveModal(true);
  };

  const handleReject = (returnData) => {
    setSelectedReturn(returnData);
    setShowRejectModal(true);
  };

  const handleModalClose = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedReturn(null);
    loadReturns();
  };

  const filteredReturns = returns?.filter(ret => {
    if (filterStatus === 'all') return true;
    return ret?.status === filterStatus;
  }) || [];

  const getStatusCounts = () => {
    return {
      all: returns?.length || 0,
      pending: returns?.filter(r => r?.status === 'pending')?.length || 0,
      approved: returns?.filter(r => r?.status === 'approved')?.length || 0,
      rejected: returns?.filter(r => r?.status === 'rejected')?.length || 0,
      completed: returns?.filter(r => r?.status === 'completed')?.length || 0
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Return Requests Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review and process customer return requests
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <div className="bg-yellow-100 px-3 py-2 rounded-md">
                <p className="text-xs text-yellow-800 font-medium">Pending</p>
                <p className="text-lg font-bold text-yellow-900">{statusCounts?.pending}</p>
              </div>
              <div className="bg-green-100 px-3 py-2 rounded-md">
                <p className="text-xs text-green-800 font-medium">Approved</p>
                <p className="text-lg font-bold text-green-900">{statusCounts?.approved}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'approved', 'rejected', 'completed']?.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`${
                    filterStatus === status
                      ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {status}
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                    {statusCounts?.[status]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Returns List */}
        {filteredReturns?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all' ?'You have not received any return requests yet.'
                : `No ${filterStatus} returns found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns?.map((returnItem) => (
              <VendorReturnCard 
                key={returnItem?.id} 
                returnData={returnItem}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
      {/* Modals */}
      {showApproveModal && selectedReturn && (
        <ApproveReturnModal
          returnData={selectedReturn}
          onClose={handleModalClose}
        />
      )}
      {showRejectModal && selectedReturn && (
        <RejectReturnModal
          returnData={selectedReturn}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
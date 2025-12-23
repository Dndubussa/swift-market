'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { getVendorProfile } from '@/lib/services/productService';
import { 
  getReturnById, 
  approveReturn, 
  rejectReturn, 
  markReturnProcessing,
  completeReturn 
} from '@/lib/services/returnService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const STATUS_INFO = {
  pending: { label: 'Pending Review', color: 'bg-warning', icon: 'ClockIcon', description: 'Awaiting your decision' },
  approved: { label: 'Approved', color: 'bg-info', icon: 'CheckIcon', description: 'Waiting for item return' },
  processing: { label: 'Processing', color: 'bg-accent', icon: 'CogIcon', description: 'Item received, processing refund' },
  completed: { label: 'Completed', color: 'bg-success', icon: 'CheckCircleIcon', description: 'Refund processed' },
  rejected: { label: 'Rejected', color: 'bg-error', icon: 'XCircleIcon', description: 'Return declined' },
  cancelled: { label: 'Cancelled', color: 'bg-muted-foreground', icon: 'NoSymbolIcon', description: 'Return cancelled by buyer' }
};

export default function ReturnDetailsInteractive({ returnId }) {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/user-login');
        return;
      }
      
      if (userProfile?.role !== 'vendor') {
        router.push('/');
        return;
      }
      
      loadData();
    }
  }, [user, userProfile, authLoading, router, returnId]);

  const loadData = async () => {
    const profile = await getVendorProfile(user.id);
    if (!profile) {
      router.push('/vendor-dashboard');
      return;
    }
    setVendorProfile(profile);
    
    const data = await getReturnById(returnId, profile.id);
    if (!data) {
      router.push('/vendor-dashboard/returns');
      return;
    }
    setReturnData(data);
    
    // Calculate default refund amount
    const totalRefund = data.return_items?.reduce((sum, item) => 
      sum + parseFloat(item.refund_amount || item.order_item?.total_price || 0), 0
    ) || 0;
    setRefundAmount(totalRefund.toString());
    
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!confirm('Approve this return request? The customer will be notified to ship the item back.')) return;
    
    setProcessing(true);
    const result = await approveReturn(returnId, vendorProfile.id, vendorNotes);
    
    if (result.success) {
      setReturnData(prev => ({ ...prev, status: 'approved' }));
    } else {
      alert(result.error || 'Failed to approve return');
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    const result = await rejectReturn(returnId, vendorProfile.id, rejectionReason);
    
    if (result.success) {
      setShowRejectModal(false);
      setReturnData(prev => ({ 
        ...prev, 
        status: 'rejected',
        rejection_reason: rejectionReason
      }));
    } else {
      alert(result.error || 'Failed to reject return');
    }
    setProcessing(false);
  };

  const handleMarkProcessing = async () => {
    if (!confirm('Mark this return as processing? This indicates you have received the returned item.')) return;
    
    setProcessing(true);
    const result = await markReturnProcessing(returnId, vendorProfile.id);
    
    if (result.success) {
      setReturnData(prev => ({ ...prev, status: 'processing' }));
    } else {
      alert(result.error || 'Failed to update status');
    }
    setProcessing(false);
  };

  const handleCompleteRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }
    
    setProcessing(true);
    const result = await completeReturn(returnId, vendorProfile.id, parseFloat(refundAmount), refundMethod);
    
    if (result.success) {
      setShowRefundModal(false);
      setReturnData(prev => ({ 
        ...prev, 
        status: 'completed',
        refund_amount: refundAmount,
        refund_status: 'completed',
        refund_method: refundMethod
      }));
    } else {
      alert(result.error || 'Failed to process refund');
    }
    setProcessing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const statusInfo = returnData ? (STATUS_INFO[returnData.status] || STATUS_INFO.pending) : STATUS_INFO.pending;

  return (
    <DashboardLayout
      role="vendor"
      title={returnData ? returnData.rma_number : 'Return Details'}
      subtitle={returnData ? `Status: ${statusInfo.label}` : 'Loading...'}
    >
      {(authLoading || loading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading return details...</p>
          </div>
        </div>
      ) : !returnData ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Icon name="ExclamationTriangleIcon" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Return Not Found</h2>
            <Link href="/vendor-dashboard/returns" className="text-primary hover:underline">
              Back to Returns
            </Link>
          </div>
        </div>
      ) : (
      <>
        {/* Return Status Header */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              Requested on {formatDate(returnData.requested_at)}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {returnData.status === 'pending' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Icon name="CheckCircleIcon" size={18} />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Icon name="XCircleIcon" size={18} />
                  Reject
                </button>
              </>
            )}
            {returnData.status === 'approved' && (
              <button
                onClick={handleMarkProcessing}
                disabled={processing}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Icon name="CubeIcon" size={18} />
                Item Received
              </button>
            )}
            {(returnData.status === 'approved' || returnData.status === 'processing') && (
              <button
                onClick={() => setShowRefundModal(true)}
                disabled={processing}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Icon name="BanknotesIcon" size={18} />
                Process Refund
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return Reason */}
            <div className="bg-card rounded-lg border border-border shadow-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Return Reason</h2>
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <Icon name="ExclamationCircleIcon" size={24} className="text-warning flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{returnData.reason_label}</p>
                  {returnData.customer_notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {returnData.customer_notes}
                    </p>
                  )}
                </div>
              </div>
              
              {returnData.return_images && returnData.return_images.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">Customer Photos</h3>
                  <div className="flex gap-2 flex-wrap">
                    {returnData.return_images.map((img, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <AppImage src={img} alt={`Return photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Items to Return */}
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Items to Return</h2>
              </div>
              <div className="divide-y divide-border">
                {returnData.return_items?.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.order_item?.product_image ? (
                        <AppImage 
                          src={item.order_item.product_image} 
                          alt={item.order_item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="PhotoIcon" size={24} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{item.order_item?.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Returning: {item.quantity} of {item.order_item?.quantity} ordered
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Unit price: {formatCurrency(item.order_item?.unit_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Refund Amount</p>
                      <p className="font-semibold text-foreground">{formatCurrency(item.refund_amount || item.order_item?.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Refund */}
              <div className="p-4 bg-muted/30 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Refund Amount</span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(
                    returnData.return_items?.reduce((sum, item) => 
                      sum + parseFloat(item.refund_amount || item.order_item?.total_price || 0), 0
                    )
                  )}
                </span>
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {returnData.status === 'rejected' && returnData.rejection_reason && (
              <div className="bg-card rounded-lg border border-error/20 shadow-card p-4">
                <div className="flex items-start gap-3">
                  <Icon name="XCircleIcon" size={24} className="text-error flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Rejection Reason</h3>
                    <p className="text-muted-foreground">{returnData.rejection_reason}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rejected on {formatDate(returnData.rejected_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Refund Info (if completed) */}
            {returnData.status === 'completed' && (
              <div className="bg-card rounded-lg border border-success/20 shadow-card p-4">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={24} className="text-success flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Refund Processed</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium text-foreground">{formatCurrency(returnData.refund_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Method</p>
                        <p className="font-medium text-foreground capitalize">
                          {returnData.refund_method?.replace('_', ' ') || 'Original payment'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Completed on {formatDate(returnData.completed_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Original Order */}
            <div className="bg-card rounded-lg border border-border shadow-card p-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">Original Order</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <Link href={`/vendor-dashboard/orders/${returnData.order?.id}`} className="text-primary hover:underline">
                    {returnData.order?.order_number}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="text-foreground">{formatDate(returnData.order?.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="text-foreground">{formatCurrency(returnData.order?.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <span className="text-foreground capitalize">{returnData.order?.status}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-card rounded-lg border border-border shadow-card p-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">Customer</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {returnData.buyer?.avatar_url ? (
                    <AppImage 
                      src={returnData.buyer.avatar_url} 
                      alt={returnData.buyer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="UserIcon" size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{returnData.buyer?.full_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{returnData.buyer?.email}</p>
                </div>
              </div>
              {returnData.buyer?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="PhoneIcon" size={16} />
                  <span>{returnData.buyer.phone}</span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-lg border border-border shadow-card p-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-success"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Request Submitted</p>
                    <p className="text-xs text-muted-foreground">{formatDate(returnData.requested_at)}</p>
                  </div>
                </div>
                {returnData.approved_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-info"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Approved</p>
                      <p className="text-xs text-muted-foreground">{formatDate(returnData.approved_at)}</p>
                    </div>
                  </div>
                )}
                {returnData.rejected_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-error"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Rejected</p>
                      <p className="text-xs text-muted-foreground">{formatDate(returnData.rejected_at)}</p>
                    </div>
                  </div>
                )}
                {returnData.completed_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-success"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Refund Completed</p>
                      <p className="text-xs text-muted-foreground">{formatDate(returnData.completed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reject Return Request</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this return is being rejected..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                Reject Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Process Refund</h3>
              <button onClick={() => setShowRefundModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Refund Amount (TZS) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Refund Method
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="original_payment">Original Payment Method</option>
                  <option value="store_credit">Store Credit</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              <div className="p-3 bg-info/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                  This will mark the return as completed and notify the customer.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRefund}
                disabled={processing || !refundAmount || parseFloat(refundAmount) <= 0}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </DashboardLayout>
  );
}

ReturnDetailsInteractive.propTypes = {
  returnId: PropTypes.string.isRequired
};


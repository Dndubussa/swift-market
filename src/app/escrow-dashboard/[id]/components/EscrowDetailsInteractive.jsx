'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { 
  getEscrowAccountById,
  requestEscrowRelease,
  refundEscrowFunds,
  initiateEscrowDispute
} from '@/lib/services/escrowService';
import Icon from '@/components/ui/AppIcon';

export default function EscrowDetailsInteractive({ escrowId }) {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [escrowAccount, setEscrowAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  useEffect(() => {
    if (user && userProfile && escrowId) {
      loadEscrowAccount();
    }
  }, [user, userProfile, escrowId]);

  const loadEscrowAccount = async () => {
    try {
      setLoading(true);
      const account = await getEscrowAccountById(escrowId);
      
      // Check if user has access to this escrow account
      if (account) {
        const isAuthorized = 
          account.buyerId === userProfile.id || 
          account.vendorId === userProfile.id ||
          userProfile.role === 'admin';
        
        if (!isAuthorized) {
          setError('You do not have permission to view this escrow account');
          return;
        }
        
        setEscrowAccount(account);
      } else {
        setError('Escrow account not found');
      }
    } catch (err) {
      setError('Failed to load escrow account');
      console.error('Error loading escrow account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRelease = () => {
    setShowReleaseModal(true);
  };

  const handleInitiateDispute = () => {
    setShowDisputeModal(true);
  };

  const submitReleaseRequest = async () => {
    try {
      await requestEscrowRelease(escrowAccount.id, user.id, {
        amount: escrowAccount.amount,
        reason: releaseReason,
        notes: 'Requested through escrow details page'
      });
      
      setShowReleaseModal(false);
      setReleaseReason('');
      loadEscrowAccount();
      
      alert('Release request submitted successfully!');
    } catch (err) {
      alert('Failed to submit release request: ' + err.message);
    }
  };

  const submitDispute = async () => {
    try {
      await initiateEscrowDispute(escrowAccount.id, user.id, {
        issueType: disputeReason,
        description: disputeDescription,
        reason: disputeReason,
        amount: escrowAccount.amount
      });
      
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeDescription('');
      loadEscrowAccount();
      
      alert('Dispute initiated successfully!');
    } catch (err) {
      alert('Failed to initiate dispute: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      created: 'bg-gray-100 text-gray-800',
      funded: 'bg-blue-100 text-blue-800',
      released: 'bg-green-100 text-green-800',
      refunded: 'bg-yellow-100 text-yellow-800',
      disputed: 'bg-red-100 text-red-800',
      resolved: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.created;
  };

  const getStatusIcon = (status) => {
    const icons = {
      created: 'ClockIcon',
      funded: 'CurrencyDollarIcon',
      released: 'CheckCircleIcon',
      refunded: 'ArrowUturnLeftIcon',
      disputed: 'ExclamationTriangleIcon',
      resolved: 'ScaleIcon'
    };
    return icons[status] || icons.created;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role={userProfile?.role} title="Escrow Details" subtitle="View escrow account details">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground">Loading escrow account...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role={userProfile?.role} title="Escrow Details" subtitle="View escrow account details">
        <div className="bg-error/10 border border-error/20 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Icon name="ExclamationCircleIcon" size={24} className="text-error" />
            <span className="text-error font-medium">{error}</span>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userProfile?.role} title="Escrow Details" subtitle="View escrow account details">
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">
              Escrow Account #{escrowAccount?.id?.substring(0, 8)}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Order #{escrowAccount?.order?.orderNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(escrowAccount?.status)}`}>
              {escrowAccount?.status?.charAt(0).toUpperCase() + escrowAccount?.status?.slice(1)}
            </span>
            <button
              onClick={() => router.back()}
              className="px-3 py-1.5 bg-muted text-foreground text-sm rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-1"
            >
              <Icon name="ArrowLeftIcon" size={16} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Summary */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Account Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Amount</h4>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(escrowAccount?.amount)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                <p className="text-foreground">
                  {formatDate(escrowAccount?.createdAt)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Buyer</h4>
                <p className="text-foreground">
                  {escrowAccount?.order?.buyer?.fullName}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Vendor</h4>
                <p className="text-foreground">
                  {escrowAccount?.order?.vendor?.businessName}
                </p>
              </div>
            </div>
            
            {escrowAccount?.status === 'funded' && (
              <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
                <button
                  onClick={handleRequestRelease}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Icon name="ArrowUpIcon" size={18} />
                  Request Release
                </button>
                <button
                  onClick={handleInitiateDispute}
                  className="px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2"
                >
                  <Icon name="ExclamationTriangleIcon" size={18} />
                  Initiate Dispute
                </button>
              </div>
            )}
          </div>
          
          {/* Transaction History */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Transaction History</h3>
            
            {escrowAccount?.transactions?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {escrowAccount?.transactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.transactionType === 'deposit' ? 'bg-blue-100 text-blue-800' :
                        transaction.transactionType === 'release' ? 'bg-green-100 text-green-800' :
                        transaction.transactionType === 'refund' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <Icon 
                          name={
                            transaction.transactionType === 'deposit' ? 'ArrowDownIcon' :
                            transaction.transactionType === 'release' ? 'ArrowUpIcon' :
                            transaction.transactionType === 'refund' ? 'ArrowUturnLeftIcon' :
                            'ArrowPathIcon'
                          } 
                          size={20} 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {transaction.transactionType.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {transaction.transactionType === 'deposit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Details */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Order Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Order Number</h4>
                <p className="text-foreground">#{escrowAccount?.order?.orderNumber}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Order Status</h4>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-foreground">
                  {escrowAccount?.order?.status?.charAt(0).toUpperCase() + escrowAccount?.order?.status?.slice(1)}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Amount</h4>
                <p className="text-foreground">{formatCurrency(escrowAccount?.order?.totalAmount)}</p>
              </div>
              
              <button
                onClick={() => router.push(`/order-tracking?orderId=${escrowAccount?.orderId}`)}
                className="w-full mt-4 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-center"
              >
                View Order Details
              </button>
            </div>
          </div>
          
          {/* Escrow Status Timeline */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Escrow Timeline</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  escrowAccount?.status === 'created' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon name="ClockIcon" size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground">Account Created</p>
                  <p className="text-xs text-muted-foreground">
                    {escrowAccount?.createdAt ? formatDate(escrowAccount?.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
              
              {escrowAccount?.fundedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    <Icon name="CurrencyDollarIcon" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Funds Deposited</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(escrowAccount?.fundedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {escrowAccount?.releasedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">
                    <Icon name="CheckCircleIcon" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Funds Released</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(escrowAccount?.releasedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {escrowAccount?.refundedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500 text-white">
                    <Icon name="ArrowUturnLeftIcon" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Funds Refunded</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(escrowAccount?.refundedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {escrowAccount?.status === 'disputed' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                    <Icon name="ExclamationTriangleIcon" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Dispute Initiated</p>
                    <p className="text-xs text-muted-foreground">
                      Escrow funds are frozen pending resolution
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Release Request Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-foreground">Request Fund Release</h3>
                <button 
                  onClick={() => setShowReleaseModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  You are requesting to release funds for this escrow account
                </p>
                <p className="text-lg font-medium text-foreground">
                  Amount: {formatCurrency(escrowAccount?.amount)}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason for release
                </label>
                <textarea
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  rows={3}
                  placeholder="Describe why you're requesting this release..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReleaseModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReleaseRequest}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-foreground">Initiate Dispute</h3>
                <button 
                  onClick={() => setShowDisputeModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  You are initiating a dispute for this escrow account
                </p>
                <p className="text-lg font-medium text-foreground">
                  Amount: {formatCurrency(escrowAccount?.amount)}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason for dispute
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="">Select a reason</option>
                  <option value="product_not_received">Product not received</option>
                  <option value="product_damaged">Product damaged/defective</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="service_not_provided">Service not provided</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Detailed description
                </label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  rows={4}
                  placeholder="Provide detailed information about your dispute..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDispute}
                  className="flex-1 px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
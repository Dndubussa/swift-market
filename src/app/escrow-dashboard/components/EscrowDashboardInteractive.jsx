'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { 
  getUserEscrowAccounts, 
  requestEscrowRelease, 
  refundEscrowFunds, 
  initiateEscrowDispute 
} from '@/lib/services/escrowService';
import Icon from '@/components/ui/AppIcon';

export default function EscrowDashboardInteractive() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [escrowAccounts, setEscrowAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [releaseReason, setReleaseReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  useEffect(() => {
    if (user && userProfile) {
      loadEscrowAccounts();
    }
  }, [user, userProfile]);

  const loadEscrowAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await getUserEscrowAccounts(
        userProfile.id, 
        userProfile.role === 'buyer' ? 'buyer' : 'vendor',
        { status: activeTab === 'all' ? null : activeTab }
      );
      setEscrowAccounts(accounts);
    } catch (err) {
      setError('Failed to load escrow accounts');
      console.error('Error loading escrow accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRequestRelease = (escrowAccount) => {
    setSelectedEscrow(escrowAccount);
    setShowReleaseModal(true);
  };

  const handleInitiateDispute = (escrowAccount) => {
    setSelectedEscrow(escrowAccount);
    setShowDisputeModal(true);
  };

  const submitReleaseRequest = async () => {
    try {
      await requestEscrowRelease(selectedEscrow.id, user.id, {
        amount: selectedEscrow.amount,
        reason: releaseReason,
        notes: 'Requested through dashboard'
      });
      
      setShowReleaseModal(false);
      setReleaseReason('');
      setSelectedEscrow(null);
      loadEscrowAccounts();
      
      alert('Release request submitted successfully!');
    } catch (err) {
      alert('Failed to submit release request: ' + err.message);
    }
  };

  const submitDispute = async () => {
    try {
      await initiateEscrowDispute(selectedEscrow.id, user.id, {
        issueType: 'other',
        description: disputeDescription,
        reason: disputeReason,
        amount: selectedEscrow.amount
      });
      
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeDescription('');
      setSelectedEscrow(null);
      loadEscrowAccounts();
      
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
      <DashboardLayout role={userProfile?.role} title="Escrow Dashboard" subtitle="Manage your escrow accounts">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground">Loading escrow accounts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userProfile?.role} title="Escrow Dashboard" subtitle="Manage your escrow accounts">
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Your Escrow Accounts</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Securely manage payments for your transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="ShieldCheckIcon" size={24} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {escrowAccounts.length} Active Escrow Accounts
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg border border-border mb-6">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Accounts' },
              { id: 'funded', label: 'Funded' },
              { id: 'released', label: 'Released' },
              { id: 'refunded', label: 'Refunded' },
              { id: 'disputed', label: 'Disputed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Escrow Accounts List */}
        <div className="p-6">
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Icon name="ExclamationCircleIcon" size={20} className="text-error" />
                <span className="text-error font-medium">{error}</span>
              </div>
            </div>
          )}

          {escrowAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="CurrencyDollarIcon" size={48} className="mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No escrow accounts found</h3>
              <p className="mt-2 text-muted-foreground">
                {activeTab === 'all' 
                  ? "You don't have any escrow accounts yet." 
                  : `You don't have any ${activeTab} escrow accounts.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {escrowAccounts.map((escrow) => (
                <div key={escrow.id} className="border border-border rounded-lg p-4 hover:shadow-card transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(escrow.status)}`}>
                          <Icon name={getStatusIcon(escrow.status)} size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            Order #{escrow.order?.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {escrow.order?.vendor?.businessName || escrow.order?.buyer?.fullName}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(escrow.amount)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(escrow.status)}`}>
                              {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Created {formatDate(escrow.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {escrow.status === 'funded' && (
                        <>
                          <button
                            onClick={() => handleRequestRelease(escrow)}
                            className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Request Release
                          </button>
                          <button
                            onClick={() => handleInitiateDispute(escrow)}
                            className="px-3 py-1.5 bg-error text-error-foreground text-sm rounded-lg hover:bg-error/90 transition-colors"
                          >
                            Dispute
                          </button>
                        </>
                      )}
                      
                      {escrow.status === 'disputed' && (
                        <button
                          onClick={() => alert('Dispute is being reviewed by our team')}
                          className="px-3 py-1.5 bg-muted text-foreground text-sm rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          View Dispute
                        </button>
                      )}
                      
                      {(escrow.status === 'released' || escrow.status === 'refunded') && (
                        <button
                          onClick={() => alert('Transaction completed')}
                          className="px-3 py-1.5 bg-muted text-foreground text-sm rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Transaction History */}
                  {escrow.transactions?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-foreground mb-2">Transaction History</h4>
                      <div className="space-y-2">
                        {escrow.transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon 
                                name={
                                  transaction.transactionType === 'deposit' ? 'ArrowDownIcon' :
                                  transaction.transactionType === 'release' ? 'ArrowUpIcon' :
                                  'ArrowPathIcon'
                                } 
                                size={16} 
                                className="text-muted-foreground" 
                              />
                              <span className="text-muted-foreground capitalize">
                                {transaction.transactionType.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="font-medium">
                              {transaction.transactionType === 'deposit' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                  You are requesting to release funds for order #{selectedEscrow?.order?.orderNumber}
                </p>
                <p className="text-lg font-medium text-foreground">
                  Amount: {formatCurrency(selectedEscrow?.amount)}
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
                  You are initiating a dispute for order #{selectedEscrow?.order?.orderNumber}
                </p>
                <p className="text-lg font-medium text-foreground">
                  Amount: {formatCurrency(selectedEscrow?.amount)}
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
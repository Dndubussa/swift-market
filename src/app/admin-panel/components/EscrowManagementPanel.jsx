'use client';

import { useState, useEffect } from 'react';
import { 
  getEscrowAccountById,
  approveEscrowRelease,
  refundEscrowFunds,
  resolveEscrowDispute
} from '@/lib/services/escrowService';
import Icon from '@/components/ui/AppIcon';

export default function EscrowManagementPanel() {
  const [escrowAccounts, setEscrowAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionType, setResolutionType] = useState('release');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // In a real implementation, this would fetch disputed escrow accounts
  useEffect(() => {
    // Mock data for demonstration
    const mockAccounts = [
      {
        id: 'escrow-1',
        orderId: 'order-123',
        orderNumber: 'ORD-2025-001234',
        buyerName: 'Amina Hassan',
        vendorName: 'Dar Electronics Hub',
        amount: 2500000,
        status: 'disputed',
        createdAt: '2025-12-15T10:30:00Z',
        disputeReason: 'Product not received',
        disputeDescription: 'Buyer claims the product was never delivered despite tracking showing it was.'
      },
      {
        id: 'escrow-2',
        orderId: 'order-124',
        orderNumber: 'ORD-2025-001235',
        buyerName: 'John Mwangi',
        vendorName: 'Maasai Crafts Co.',
        amount: 45000,
        status: 'disputed',
        createdAt: '2025-12-16T14:20:00Z',
        disputeReason: 'Product damaged',
        disputeDescription: 'Product arrived damaged. Photos provided show significant damage to packaging and item.'
      }
    ];
    
    setEscrowAccounts(mockAccounts);
    setLoading(false);
  }, []);

  const handleApproveRelease = async (escrowId) => {
    if (window.confirm('Are you sure you want to approve this release?')) {
      try {
        // In a real implementation:
        // await approveEscrowRelease(escrowId, 'admin-user-id');
        alert('Release approved successfully!');
        // Refresh the list
        setEscrowAccounts(prev => prev.filter(acc => acc.id !== escrowId));
      } catch (error) {
        alert('Failed to approve release: ' + error.message);
      }
    }
  };

  const handleRefund = async (escrowId) => {
    if (window.confirm('Are you sure you want to refund this amount to the buyer?')) {
      try {
        // In a real implementation:
        // await refundEscrowFunds(escrowId, { amount: selectedAccount.amount, reason: 'Admin refund' });
        alert('Refund processed successfully!');
        // Refresh the list
        setEscrowAccounts(prev => prev.filter(acc => acc.id !== escrowId));
      } catch (error) {
        alert('Failed to process refund: ' + error.message);
      }
    }
  };

  const handleResolveDispute = (account) => {
    setSelectedAccount(account);
    setShowResolveModal(true);
  };

  const submitResolution = async () => {
    try {
      // In a real implementation:
      // await resolveEscrowDispute(selectedAccount.id, {
      //   resolutionType,
      //   amount: selectedAccount.amount,
      //   notes: resolutionNotes
      // });
      
      alert(`Dispute resolved with ${resolutionType} decision!`);
      setShowResolveModal(false);
      setResolutionType('release');
      setResolutionNotes('');
      setSelectedAccount(null);
      // Refresh the list
      setEscrowAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
    } catch (error) {
      alert('Failed to resolve dispute: ' + error.message);
    }
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
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground">Escrow Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage disputed escrow accounts and resolve issues
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="ScaleIcon" size={24} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {escrowAccounts.length} Disputed Accounts
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2 text-foreground">Loading disputed accounts...</span>
          </div>
        ) : escrowAccounts.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CheckCircleIcon" size={48} className="mx-auto text-muted-foreground" />
            <h4 className="mt-4 text-lg font-medium text-foreground">No disputed accounts</h4>
            <p className="mt-2 text-muted-foreground">
              All escrow accounts are currently in good standing
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {escrowAccounts.map((account) => (
              <div key={account.id} className="border border-border rounded-lg p-4 hover:shadow-card transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-100 text-red-800">
                        <Icon name="ExclamationTriangleIcon" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Order #{account.orderNumber}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {account.buyerName} → {account.vendorName}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(account.amount)}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Disputed
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(account.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-foreground">
                            <span className="font-medium">Reason:</span> {account.disputeReason}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {account.disputeDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveRelease(account.id)}
                      className="px-3 py-1.5 bg-success text-success-foreground text-sm rounded-lg hover:bg-success/90 transition-colors"
                    >
                      Approve Release
                    </button>
                    <button
                      onClick={() => handleRefund(account.id)}
                      className="px-3 py-1.5 bg-warning text-warning-foreground text-sm rounded-lg hover:bg-warning/90 transition-colors"
                    >
                      Refund Buyer
                    </button>
                    <button
                      onClick={() => handleResolveDispute(account)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolveModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-foreground">Resolve Dispute</h3>
                <button 
                  onClick={() => setShowResolveModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Resolving dispute for order #{selectedAccount.orderNumber}
                </p>
                <p className="text-lg font-medium text-foreground">
                  Amount: {formatCurrency(selectedAccount.amount)}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resolution Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResolutionType('release')}
                    className={`p-4 rounded-lg border transition-colors ${
                      resolutionType === 'release' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Icon name="ArrowUpIcon" size={24} className="mx-auto text-success" />
                    <span className="block mt-2 text-sm font-medium">Release to Vendor</span>
                  </button>
                  <button
                    onClick={() => setResolutionType('refund')}
                    className={`p-4 rounded-lg border transition-colors ${
                      resolutionType === 'refund' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Icon name="ArrowUturnLeftIcon" size={24} className="mx-auto text-warning" />
                    <span className="block mt-2 text-sm font-medium">Refund to Buyer</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  rows={3}
                  placeholder="Add any additional notes about this resolution..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResolution}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
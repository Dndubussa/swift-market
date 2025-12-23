'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import { getVendorProfile } from '@/lib/services/productService';
import {
  getVendorBalance,
  getEarningsBreakdown,
  getPayoutMethods,
  addPayoutMethod,
  deletePayoutMethod,
  setDefaultPayoutMethod,
  requestPayout,
  getPayoutHistory,
  getPayoutStats,
  cancelPayout,
  getTransactionHistory
} from '@/lib/services/payoutService';
import Icon from '@/components/ui/AppIcon';

const PAYOUT_STATUSES = [
  { value: 'all', label: 'All', color: 'bg-muted' },
  { value: 'pending', label: 'Pending', color: 'bg-warning' },
  { value: 'processing', label: 'Processing', color: 'bg-info' },
  { value: 'completed', label: 'Completed', color: 'bg-success' },
  { value: 'failed', label: 'Failed', color: 'bg-error' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-muted-foreground' },
];

const MOBILE_NETWORKS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'tigopesa', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'halopesa', label: 'Halopesa' },
];

export default function VendorPayoutsInteractive() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history' | 'methods'
  
  // Balance & Earnings
  const [balance, setBalance] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [earningsPeriod, setEarningsPeriod] = useState('month');
  
  // Payout Methods
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newMethod, setNewMethod] = useState({
    method_type: 'mobile_money',
    bank_name: '',
    account_number: '',
    account_name: '',
    mobile_network: 'mpesa',
    mobile_number: '',
    paypal_email: '',
    is_default: false
  });
  
  // Payout Request
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  
  // History
  const [payouts, setPayouts] = useState([]);
  const [payoutStats, setPayoutStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Transactions
  const [transactions, setTransactions] = useState([]);
  
  const [processing, setProcessing] = useState(false);
  const pageSize = 10;

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
      
      loadInitialData();
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    if (vendorProfile) {
      loadEarnings();
    }
  }, [vendorProfile, earningsPeriod]);

  useEffect(() => {
    if (vendorProfile && activeTab === 'history') {
      loadPayoutHistory();
    }
  }, [vendorProfile, activeTab, statusFilter, currentPage]);

  const loadInitialData = async () => {
    const profile = await getVendorProfile(user.id);
    if (profile) {
      setVendorProfile(profile);
      
      const [balanceData, methodsData, statsData, transData] = await Promise.all([
        getVendorBalance(profile.id),
        getPayoutMethods(profile.id),
        getPayoutStats(profile.id),
        getTransactionHistory(profile.id, { limit: 10 })
      ]);
      
      setBalance(balanceData);
      setPayoutMethods(methodsData);
      setPayoutStats(statsData);
      setTransactions(transData);
      
      if (methodsData.length > 0) {
        setSelectedMethod(methodsData.find(m => m.is_default)?.id || methodsData[0].id);
      }
    }
    setLoading(false);
  };

  const loadEarnings = async () => {
    const data = await getEarningsBreakdown(vendorProfile.id, earningsPeriod);
    setEarnings(data);
  };

  const loadPayoutHistory = async () => {
    const { payouts: fetchedPayouts, count } = await getPayoutHistory(vendorProfile.id, {
      page: currentPage,
      limit: pageSize,
      status: statusFilter
    });
    setPayouts(fetchedPayouts);
    setTotalCount(count);
  };

  const handleAddMethod = async () => {
    setProcessing(true);
    const result = await addPayoutMethod(vendorProfile.id, newMethod);
    
    if (result.success) {
      const methods = await getPayoutMethods(vendorProfile.id);
      setPayoutMethods(methods);
      setShowAddMethodModal(false);
      setNewMethod({
        method_type: 'mobile_money',
        bank_name: '',
        account_number: '',
        account_name: '',
        mobile_network: 'mpesa',
        mobile_number: '',
        paypal_email: '',
        is_default: false
      });
    } else {
      alert(result.error || 'Failed to add payout method');
    }
    setProcessing(false);
  };

  const handleDeleteMethod = async (methodId) => {
    if (!confirm('Delete this payout method?')) return;
    
    const result = await deletePayoutMethod(methodId, vendorProfile.id);
    if (result.success) {
      setPayoutMethods(prev => prev.filter(m => m.id !== methodId));
    } else {
      alert(result.error || 'Failed to delete method');
    }
  };

  const handleSetDefault = async (methodId) => {
    const result = await setDefaultPayoutMethod(methodId, vendorProfile.id);
    if (result.success) {
      setPayoutMethods(prev => prev.map(m => ({ ...m, is_default: m.id === methodId })));
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!selectedMethod) {
      alert('Please select a payout method');
      return;
    }
    
    setProcessing(true);
    const result = await requestPayout(vendorProfile.id, parseFloat(payoutAmount), selectedMethod, payoutNotes);
    
    if (result.success) {
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPayoutNotes('');
      
      // Refresh data
      const [balanceData, statsData] = await Promise.all([
        getVendorBalance(vendorProfile.id),
        getPayoutStats(vendorProfile.id)
      ]);
      setBalance(balanceData);
      setPayoutStats(statsData);
      
      alert('Payout request submitted successfully!');
    } else {
      alert(result.error || 'Failed to request payout');
    }
    setProcessing(false);
  };

  const handleCancelPayout = async (payoutId) => {
    if (!confirm('Cancel this payout request?')) return;
    
    const result = await cancelPayout(payoutId, vendorProfile.id);
    if (result.success) {
      loadPayoutHistory();
      const balanceData = await getVendorBalance(vendorProfile.id);
      setBalance(balanceData);
    } else {
      alert(result.error || 'Failed to cancel payout');
    }
  };

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusObj = PAYOUT_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'bg-muted';
  };

  const getMethodLabel = (method) => {
    if (method.method_type === 'mobile_money') {
      const network = MOBILE_NETWORKS.find(n => n.value === method.mobile_network);
      return `${network?.label || method.mobile_network} - ${method.mobile_number}`;
    }
    if (method.method_type === 'bank_transfer') {
      return `${method.bank_name} - ***${method.account_number?.slice(-4)}`;
    }
    if (method.method_type === 'paypal') {
      return `PayPal - ${method.paypal_email}`;
    }
    return 'Unknown Method';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout
      role="vendor"
      title="Earnings & Payouts"
      subtitle="Manage your earnings and request withdrawals"
      actions={
        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={!balance?.available_balance || balance.available_balance < 10000}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Icon name="BanknotesIcon" size={18} />
          <span className="hidden sm:inline">Request Payout</span>
        </button>
      }
    >
      {(authLoading || loading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payouts...</p>
          </div>
        </div>
      ) : (
      <>
        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-success to-success/80 rounded-lg p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon name="WalletIcon" size={24} />
              </div>
              <span className="text-white/80">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(balance?.available_balance)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-warning to-warning/80 rounded-lg p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon name="ClockIcon" size={24} />
              </div>
              <span className="text-white/80">Pending</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(balance?.pending_balance)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon name="ArrowTrendingUpIcon" size={24} />
              </div>
              <span className="text-white/80">Total Earned</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(balance?.total_earned)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-accent to-accent/80 rounded-lg p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon name="BanknotesIcon" size={24} />
              </div>
              <span className="text-white/80">Total Withdrawn</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(balance?.total_withdrawn)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: 'overview', label: 'Overview', icon: 'ChartBarIcon' },
            { id: 'history', label: 'Payout History', icon: 'ClockIcon' },
            { id: 'methods', label: 'Payout Methods', icon: 'CreditCardIcon' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Earnings Breakdown */}
            <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Earnings Breakdown</h2>
                <select
                  value={earningsPeriod}
                  onChange={(e) => setEarningsPeriod(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              {earnings && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Total Sales</span>
                    <span className="font-semibold text-foreground">{formatCurrency(earnings.totalSales)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-semibold text-error">-{formatCurrency(earnings.platformFees)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-semibold text-foreground">Net Earnings</span>
                    <span className="text-xl font-bold text-success">{formatCurrency(earnings.netEarnings)}</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                    Based on {earnings.orderCount} completed orders
                  </div>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-card rounded-lg border border-border shadow-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No transactions yet</p>
                ) : (
                  transactions.map(tx => (
                    <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          tx.type === 'earning' ? 'bg-success/10' : 
                          tx.type === 'payout' ? 'bg-primary/10' : 'bg-error/10'
                        }`}>
                          <Icon 
                            name={tx.type === 'earning' ? 'ArrowDownIcon' : 'ArrowUpIcon'} 
                            size={14} 
                            className={tx.type === 'earning' ? 'text-success' : tx.type === 'payout' ? 'text-primary' : 'text-error'}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.reference}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${tx.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            {/* Status Filters */}
            <div className="p-4 border-b border-border flex flex-wrap gap-2">
              {PAYOUT_STATUSES.map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    setStatusFilter(status.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="BanknotesIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Payouts Found</h3>
                <p className="text-muted-foreground">
                  {statusFilter !== 'all' 
                    ? `No ${statusFilter} payouts.`
                    : 'You haven\'t requested any payouts yet.'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Reference</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Method</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payouts.map(payout => (
                        <tr key={payout.id} className="hover:bg-muted/30">
                          <td className="px-4 py-4 font-medium text-foreground">{payout.payout_reference}</td>
                          <td className="px-4 py-4 font-semibold text-foreground">{formatCurrency(payout.amount)}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                            {payout.method_type?.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(payout.created_at)}</td>
                          <td className="px-4 py-4 text-right">
                            {payout.status === 'pending' && (
                              <button
                                onClick={() => handleCancelPayout(payout.id)}
                                className="text-error hover:underline text-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'methods' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Your Payout Methods</h2>
              <button
                onClick={() => setShowAddMethodModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="PlusIcon" size={18} />
                Add Method
              </button>
            </div>

            {payoutMethods.length === 0 ? (
              <div className="bg-card rounded-lg border border-border shadow-card p-8 text-center">
                <Icon name="CreditCardIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Payout Methods</h3>
                <p className="text-muted-foreground mb-4">Add a payout method to receive your earnings</p>
                <button
                  onClick={() => setShowAddMethodModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Add Payout Method
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payoutMethods.map(method => (
                  <div key={method.id} className={`bg-card rounded-lg border shadow-card p-4 ${method.is_default ? 'border-primary' : 'border-border'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          method.method_type === 'mobile_money' ? 'bg-success/10' :
                          method.method_type === 'bank_transfer' ? 'bg-primary/10' : 'bg-accent/10'
                        }`}>
                          <Icon 
                            name={method.method_type === 'mobile_money' ? 'DevicePhoneMobileIcon' : 
                                  method.method_type === 'bank_transfer' ? 'BuildingLibraryIcon' : 'GlobeAltIcon'} 
                            size={24} 
                            className={
                              method.method_type === 'mobile_money' ? 'text-success' :
                              method.method_type === 'bank_transfer' ? 'text-primary' : 'text-accent'
                            }
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {method.method_type?.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">{getMethodLabel(method)}</p>
                        </div>
                      </div>
                      {method.is_default && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    
                    {method.account_name && (
                      <p className="text-sm text-muted-foreground mb-3">Account: {method.account_name}</p>
                    )}
                    
                    <div className="flex gap-2">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="px-3 py-1.5 bg-error/10 text-error rounded-lg text-sm hover:bg-error/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Add Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Payout Method</h3>
              <button onClick={() => setShowAddMethodModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Method Type</label>
                <select
                  value={newMethod.method_type}
                  onChange={(e) => setNewMethod({ ...newMethod, method_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {newMethod.method_type === 'mobile_money' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Mobile Network</label>
                    <select
                      value={newMethod.mobile_network}
                      onChange={(e) => setNewMethod({ ...newMethod, mobile_network: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    >
                      {MOBILE_NETWORKS.map(n => (
                        <option key={n.value} value={n.value}>{n.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newMethod.mobile_number}
                      onChange={(e) => setNewMethod({ ...newMethod, mobile_number: e.target.value })}
                      placeholder="e.g., +255 712 345 678"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                  </div>
                </>
              )}

              {newMethod.method_type === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={newMethod.bank_name}
                      onChange={(e) => setNewMethod({ ...newMethod, bank_name: e.target.value })}
                      placeholder="e.g., CRDB Bank"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Account Number</label>
                    <input
                      type="text"
                      value={newMethod.account_number}
                      onChange={(e) => setNewMethod({ ...newMethod, account_number: e.target.value })}
                      placeholder="Account number"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Account Name</label>
                    <input
                      type="text"
                      value={newMethod.account_name}
                      onChange={(e) => setNewMethod({ ...newMethod, account_name: e.target.value })}
                      placeholder="Name on the account"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                  </div>
                </>
              )}

              {newMethod.method_type === 'paypal' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">PayPal Email</label>
                  <input
                    type="email"
                    value={newMethod.paypal_email}
                    onChange={(e) => setNewMethod({ ...newMethod, paypal_email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newMethod.is_default}
                  onChange={(e) => setNewMethod({ ...newMethod, is_default: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm text-foreground">Set as default payout method</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMethodModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMethod}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Request Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg mb-4">
              <p className="text-sm text-foreground">
                Available Balance: <span className="font-bold">{formatCurrency(balance?.available_balance)}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Amount (TZS) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  min="10000"
                  max={balance?.available_balance}
                  placeholder="Minimum: 10,000"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum payout: TZS 10,000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Payout Method <span className="text-error">*</span>
                </label>
                {payoutMethods.length === 0 ? (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning">
                      Please add a payout method first.
                    </p>
                    <button
                      onClick={() => {
                        setShowPayoutModal(false);
                        setShowAddMethodModal(true);
                      }}
                      className="text-primary text-sm mt-1 hover:underline"
                    >
                      Add payout method →
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    {payoutMethods.map(m => (
                      <option key={m.id} value={m.id}>
                        {getMethodLabel(m)} {m.is_default ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
                <textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={processing || !payoutAmount || !selectedMethod || payoutMethods.length === 0}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                Request Payout
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


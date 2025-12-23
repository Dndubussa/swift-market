'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function EarningsPanel({ earnings }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="BanknotesIcon" size={24} className="text-primary" />
            <h2 className="text-xl font-heading font-bold text-foreground">Earnings Overview</h2>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 border border-success/20 rounded-md">
            <Icon name="CheckCircleIcon" size={16} className="text-success" />
            <span className="text-xs font-medium text-success">ClickPesa Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
            <p className="text-2xl font-heading font-bold text-foreground">{earnings?.availableBalance}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Pending Payments</p>
            <p className="text-2xl font-heading font-bold text-warning">{earnings?.pendingPayments}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-heading font-bold text-success">{earnings?.totalEarnings}</p>
          </div>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Icon name="ArrowDownTrayIcon" size={20} />
          <span>Request Withdrawal</span>
        </button>
      </div>
      <div className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {earnings?.recentTransactions?.map((transaction) => (
            <div
              key={transaction?.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction?.type === 'credit' ? 'bg-success/10' : 'bg-error/10'
                  }`}
                >
                  <Icon
                    name={transaction?.type === 'credit' ? 'ArrowDownIcon' : 'ArrowUpIcon'}
                    size={20}
                    className={transaction?.type === 'credit' ? 'text-success' : 'text-error'}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{transaction?.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction?.date}</p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold ${
                  transaction?.type === 'credit' ? 'text-success' : 'text-error'
                }`}
              >
                {transaction?.type === 'credit' ? '+' : '-'}
                {transaction?.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-lg shadow-modal max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-foreground">Request Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors duration-200"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Withdrawal Amount</label>
                <input
                  type="text"
                  placeholder="Enter amount in TZS"
                  className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                <select className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>M-Pesa</option>
                  <option>Tigo Pesa</option>
                  <option>Airtel Money</option>
                  <option>Halopesa</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-input rounded-md text-foreground hover:bg-muted transition-colors duration-200"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

EarningsPanel.propTypes = {
  earnings: PropTypes?.shape({
    availableBalance: PropTypes?.string?.isRequired,
    pendingPayments: PropTypes?.string?.isRequired,
    totalEarnings: PropTypes?.string?.isRequired,
    recentTransactions: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        amount: PropTypes?.string?.isRequired,
        date: PropTypes?.string?.isRequired,
        type: PropTypes?.oneOf(['credit', 'debit'])?.isRequired,
      })
    )?.isRequired,
  })?.isRequired,
};
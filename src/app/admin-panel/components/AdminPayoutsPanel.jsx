"use client";

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getPendingPayouts, processPayout } from '@/lib/services/payoutService';

export default function AdminPayoutsPanel() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getPendingPayouts();
    setPayouts(data || []);
    setLoading(false);
  }

  async function handleAction(id, action) {
    const res = await processPayout(id, action, 'admin-system');
    if (res?.success) {
      load();
      alert('Action completed');
    } else {
      alert('Failed: ' + (res?.error || 'unknown'));
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Payouts Management</h3>
        <span className="text-sm text-muted-foreground">Pending payouts</span>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : payouts.length === 0 ? (
        <p>No pending payouts</p>
      ) : (
        <div className="space-y-3">
          {payouts.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div>
                <p className="text-sm font-medium">{p.vendor?.business_name || p.vendor_id}</p>
                <p className="text-xs text-muted-foreground">TZS {p.amount} • {p.payout_reference}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleAction(p.id, 'processing')} className="px-3 py-1 bg-info text-info-foreground rounded-md">Mark Processing</button>
                <button onClick={() => handleAction(p.id, 'complete')} className="px-3 py-1 bg-success text-success-foreground rounded-md">Complete</button>
                <button onClick={() => handleAction(p.id, 'fail')} className="px-3 py-1 bg-error text-error-foreground rounded-md">Fail</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

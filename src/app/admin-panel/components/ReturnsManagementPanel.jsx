"use client";

import { useEffect, useState } from 'react';
import { getAllReturns, adminUpdateReturnStatus } from '@/lib/services/returnService';

export default function ReturnsManagementPanel() {
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { returns } = await getAllReturns({ page:1, limit: 50 });
    setReturnsList(returns || []);
    setLoading(false);
  }

  async function changeStatus(id, status) {
    const res = await adminUpdateReturnStatus(id, status, 'Admin processed');
    if (res.success) {
      load();
      alert('Updated');
    } else alert('Error: ' + res.error);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Returns Management</h3>
        <span className="text-sm text-muted-foreground">Platform returns</span>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {returnsList.map(r => (
            <div key={r.id} className="p-3 bg-muted/30 rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">{r.rma_number} • {r.reason_label}</p>
                <p className="text-xs text-muted-foreground">Buyer: {r.buyer?.full_name} • Order: {r.order?.order_number}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => changeStatus(r.id, 'approved')} className="px-3 py-1 bg-success text-success-foreground rounded-md">Approve</button>
                <button onClick={() => changeStatus(r.id, 'rejected')} className="px-3 py-1 bg-error text-error-foreground rounded-md">Reject</button>
                <button onClick={() => changeStatus(r.id, 'completed')} className="px-3 py-1 bg-primary text-primary-foreground rounded-md">Complete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

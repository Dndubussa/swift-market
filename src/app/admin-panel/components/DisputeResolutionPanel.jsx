"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { adminEscalateDispute, adminCloseDispute } from '@/lib/services/disputeService';

export default function DisputeResolutionPanel() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('disputes').select('id, dispute_number, status, buyer_id, vendor_id, issue_type').order('reported_at', { ascending: false }).limit(50);
    setDisputes(data || []);
    setLoading(false);
  }

  async function handleEscalate(id) {
    const res = await adminEscalateDispute(id, 'Admin review required');
    if (res.success) { alert('Escalated'); load(); } else alert(res.error);
  }

  async function handleClose(id) {
    const res = await adminCloseDispute(id, 'Resolved by admin');
    if (res.success) { alert('Closed'); load(); } else alert(res.error);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Dispute Resolution</h3>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {disputes.map(d => (
            <div key={d.id} className="p-3 bg-muted/30 rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">{d.dispute_number} • {d.issue_type}</p>
                <p className="text-xs text-muted-foreground">Status: {d.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEscalate(d.id)} className="px-3 py-1 bg-warning text-warning-foreground rounded-md">Escalate</button>
                <button onClick={() => handleClose(d.id)} className="px-3 py-1 bg-success text-success-foreground rounded-md">Close</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

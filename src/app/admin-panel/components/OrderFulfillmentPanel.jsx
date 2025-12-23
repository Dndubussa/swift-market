"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function OrderFulfillmentPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('id, order_number, vendor_id, status, tracking_number, shipping_method').order('created_at', { ascending: false }).limit(50);
    setOrders(data || []);
    setLoading(false);
  }

  async function updateTracking(id) {
    const tracking = prompt('Enter tracking number');
    if (!tracking) return;
    await supabase.from('orders').update({ tracking_number: tracking, status: 'shipped', updated_at: new Date().toISOString() }).eq('id', id);
    load();
    alert('Updated');
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Order Fulfillment</h3>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div>
                <p className="font-medium">#{o.order_number} • {o.status}</p>
                <p className="text-xs text-muted-foreground">Carrier: {o.shipping_method || 'N/A'} • Tracking: {o.tracking_number || '—'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateTracking(o.id)} className="px-3 py-1 bg-primary text-primary-foreground rounded-md">Update Tracking</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

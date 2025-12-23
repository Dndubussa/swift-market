"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function InventoryOverviewPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('products').select('id, name, vendor_id, stock_quantity, low_stock_threshold').order('stock_quantity', { ascending: true }).limit(50);
    setItems(data || []);
    setLoading(false);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-2">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-muted-foreground">Vendor: {i.vendor_id}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{i.stock_quantity}</p>
                <p className="text-xs text-muted-foreground">Threshold: {i.low_stock_threshold}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

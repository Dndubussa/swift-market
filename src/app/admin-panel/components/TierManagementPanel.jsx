"use client";

import { useEffect, useState } from 'react';
import { getAllTiers, getTierOrder } from '@/lib/services/sellerTierService';
import { updateVendorTier, getVendorTierStatus } from '@/lib/services/sellerTierService';

export default function TierManagementPanel() {
  const [tiers, setTiers] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorTier, setVendorTier] = useState(null);

  useEffect(() => {
    setTiers(getAllTiers());
  }, []);

  async function loadVendorTier() {
    if (!selectedVendor) return alert('Enter vendor id');
    const status = await getVendorTierStatus(selectedVendor);
    setVendorTier(status);
  }

  async function changeTier(newTier) {
    if (!selectedVendor) return alert('Enter vendor id');
    const res = await updateVendorTier(selectedVendor, newTier);
    if (res.success) {
      alert('Tier updated');
      loadVendorTier();
    } else alert('Failed: ' + res.error);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Seller Tier Management</h3>
      <div className="flex items-center gap-2 mb-4">
        <input placeholder="Vendor ID" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className="px-3 py-2 border rounded-md" />
        <button onClick={loadVendorTier} className="px-3 py-2 bg-primary text-primary-foreground rounded-md">Load</button>
      </div>
      {vendorTier ? (
        <div>
          <p>Current Tier: {vendorTier.currentTier}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(tiers).map(t => (
              <button key={t} onClick={() => changeTier(t)} className="px-3 py-1 border rounded-md">Set {tiers[t].name}</button>
            ))}
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">Load a vendor to manage tier</p>}
    </div>
  );
}

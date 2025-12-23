'use client';

import { DashboardLayout } from '@/components/dashboard';
import PropTypes from 'prop-types';

export default function OrderDetailsInteractive({ orderId }) {
  return (
    <DashboardLayout role="vendor" title="Order Details" subtitle="View and manage order">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Order Management</h2>
        <p className="text-muted-foreground">Order ID: {orderId}</p>
        <p className="text-sm text-muted-foreground mt-4">
          The full order tracking interface with timeline, items, shipping information, and payment details will be available in the next release.
        </p>
      </div>
    </DashboardLayout>
  );
}

OrderDetailsInteractive.propTypes = {
  orderId: PropTypes.string.isRequired
};
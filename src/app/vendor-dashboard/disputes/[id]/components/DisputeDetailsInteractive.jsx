'use client';

import { DashboardLayout } from '@/components/dashboard';
import PropTypes from 'prop-types';

export default function DisputeDetailsInteractive({ disputeId }) {
  return (
    <DashboardLayout role="vendor" title="Dispute Details" subtitle="Manage disputes">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Dispute Management</h2>
        <p className="text-muted-foreground">Dispute ID: {disputeId}</p>
        <p className="text-sm text-muted-foreground mt-4">
          The full dispute management interface with messaging, resolution proposals, and escalation workflows will be available in the next release.
        </p>
      </div>
    </DashboardLayout>
  );
}

DisputeDetailsInteractive.propTypes = {
  disputeId: PropTypes.string.isRequired
};
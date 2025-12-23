import DisputeDetailsInteractive from './components/DisputeDetailsInteractive';

export const metadata = {
  title: 'Dispute Details - Blinno Marketplace',
  description: 'View dispute details, respond to customer, and propose resolutions'
};

export default function DisputeDetailsPage({ params }) {
  return <DisputeDetailsInteractive disputeId={params.id} />;
}


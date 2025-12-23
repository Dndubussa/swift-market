import ReturnDetailsInteractive from './components/ReturnDetailsInteractive';

export const metadata = {
  title: 'Return Details - Blinno Marketplace',
  description: 'View and manage return request details, approve or reject, and process refunds'
};

export default function ReturnDetailsPage({ params }) {
  return <ReturnDetailsInteractive returnId={params.id} />;
}


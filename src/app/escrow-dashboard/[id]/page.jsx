import EscrowDetailsInteractive from './components/EscrowDetailsInteractive';

export default function EscrowDetailsPage({ params }) {
  return <EscrowDetailsInteractive escrowId={params.id} />;
}
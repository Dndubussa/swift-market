import { redirect } from 'next/navigation';

export default function ApprovalDetailsPage({ params }) {
  // Redirect to main approvals page since details are shown inline
  redirect('/admin-panel/vendors/approvals');
}

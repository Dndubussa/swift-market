'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function PendingApprovalsInteractive({ initialData }) {
  const router = useRouter();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-error/10 text-error border-error/20',
      normal: 'bg-info/10 text-info border-info/20',
      low: 'bg-muted text-muted-foreground border-border'
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  const getDocumentStatusColor = (status) => {
    const colors = {
      submitted: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-error/10 text-error'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const handleApprove = (application) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
  };

  const handleReject = (application) => {
    setSelectedApplication(application);
    setShowRejectModal(true);
  };

  const confirmApproval = () => {
    alert(`Application ${selectedApplication.id} approved successfully!`);
    setShowApprovalModal(false);
    router.push('/admin-panel/vendors');
  };

  const confirmRejection = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    alert(`Application ${selectedApplication.id} rejected. Reason: ${rejectReason}`);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Pending Vendor Approvals"
      subtitle="Review and approve vendor applications"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ClockIcon" size={20} className="text-warning" />
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_pending}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CalendarDaysIcon" size={20} className="text-primary" />
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
          <p className="text-2xl font-bold text-primary">{initialData?.summary?.submitted_today}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ChartBarIcon" size={20} className="text-info" />
            <p className="text-sm text-muted-foreground">This Week</p>
          </div>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.submitted_this_week}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ClockIcon" size={20} className="text-accent" />
            <p className="text-sm text-muted-foreground">Avg Approval Time</p>
          </div>
          <p className="text-2xl font-bold text-accent">{initialData?.summary?.avg_approval_time}</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {initialData?.applications?.map((application) => (
          <div key={application.id} className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Application Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{application.business_name}</h3>
                    <p className="text-sm text-muted-foreground">Application ID: {application.id}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(application.priority)}`}>
                    {application.priority.charAt(0).toUpperCase() + application.priority.slice(1)} Priority
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium text-foreground">{formatDate(application.submitted_at)}</p>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Business Info */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="BuildingStorefrontIcon" size={16} />
                    Business Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Business Type</p>
                      <p className="font-medium text-foreground">{application.business_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{application.business_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax ID</p>
                      <p className="font-mono text-foreground">{application.tax_id}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="UserIcon" size={16} />
                    Owner Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Owner Name</p>
                      <p className="font-medium text-foreground">{application.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{application.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">{application.address}</p>
                    </div>
                  </div>
                </div>

                {/* Banking Info */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="BanknotesIcon" size={16} />
                    Banking Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Bank Name</p>
                      <p className="font-medium text-foreground">{application.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Number</p>
                      <p className="font-mono text-foreground">{application.bank_account}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Initial Products</p>
                      <p className="font-medium text-foreground">{application.initial_products} products</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="DocumentTextIcon" size={16} />
                  Submitted Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {application.documents?.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleViewDocument(doc)}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="DocumentIcon" size={18} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getDocumentStatusColor(doc.status)}`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                        <Icon name="EyeIcon" size={16} className="text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(application)}
                  className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="CheckCircleIcon" size={18} />
                  Approve Application
                </button>
                <button
                  onClick={() => handleReject(application)}
                  className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="XCircleIcon" size={18} />
                  Reject Application
                </button>
                <Link
                  href={`/admin-panel/vendors/approvals/${application.id}`}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Icon name="EyeIcon" size={18} />
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {initialData?.applications?.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending applications at this time</p>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Approve Application</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedApplication.business_name}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Owner: {selectedApplication.owner_name}</p>
                  <p className="text-muted-foreground">Email: {selectedApplication.business_email}</p>
                  <p className="text-muted-foreground">Products: {selectedApplication.initial_products}</p>
                </div>
              </div>

              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm text-success">
                  <Icon name="InformationCircleIcon" size={16} className="inline mr-1" />
                  This will approve the vendor and grant them access to start selling.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedDocument.name}</h3>
                <p className="text-sm text-muted-foreground">Document Preview</p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Document Preview Area */}
              <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <Icon name="DocumentTextIcon" size={64} className="text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Document Preview</p>
                <p className="text-sm text-muted-foreground mb-6">
                  In a production environment, this would display the actual document (PDF, image, etc.)
                </p>
                
                {/* Mock Document Info */}
                <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-left">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Document Type</p>
                      <p className="text-sm font-medium text-foreground">{selectedDocument.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${getDocumentStatusColor(selectedDocument.status)}`}>
                        {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">File Type</p>
                      <p className="text-sm font-medium text-foreground">PDF Document</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">File Size</p>
                      <p className="text-sm font-medium text-foreground">2.4 MB</p>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-info flex items-center gap-1">
                        <Icon name="InformationCircleIcon" size={14} />
                        To implement: Use iframe, PDF.js, or image viewer for actual documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
              <a
                href={selectedDocument.url}
                download
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="ArrowDownTrayIcon" size={18} />
                Download Document
              </a>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reject Application</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedApplication.business_name}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Owner: {selectedApplication.owner_name}</p>
                  <p className="text-muted-foreground">Email: {selectedApplication.business_email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">
                  <Icon name="ExclamationTriangleIcon" size={16} className="inline mr-1" />
                  The vendor will be notified of this rejection via email.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

PendingApprovalsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    applications: PropTypes.array
  })
};

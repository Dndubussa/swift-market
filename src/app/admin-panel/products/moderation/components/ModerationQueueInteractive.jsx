'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function ModerationQueueInteractive({ initialData }) {
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDateTime = (dateString) => {
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

  const getFlagColor = (flag) => {
    if (flag.includes('counterfeit') || flag.includes('violation')) {
      return 'bg-error/10 text-error';
    }
    if (flag.includes('price') || flag.includes('claims')) {
      return 'bg-warning/10 text-warning';
    }
    return 'bg-info/10 text-info';
  };

  const filteredProducts = selectedPriority === 'all'
    ? initialData?.products
    : initialData?.products?.filter(p => p.priority === selectedPriority) || [];

  const handleReview = (product) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleApprove = () => {
    alert(`Product "${selectedProduct.name}" approved and published!`);
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    alert(`Product "${selectedProduct.name}" rejected. Reason: ${rejectReason}`);
    setShowReviewModal(false);
    setSelectedProduct(null);
    setRejectReason('');
  };

  return (
    <DashboardLayout
      role="admin"
      title="Product Moderation Queue"
      subtitle="Review and approve pending product submissions"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.pending}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Submitted Today</p>
          <p className="text-2xl font-bold text-primary">{initialData?.summary?.today}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.this_week}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Review Time</p>
          <p className="text-2xl font-bold text-accent">{initialData?.summary?.avg_review_time}</p>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Priority:</label>
          {['all', 'high', 'normal', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPriority === priority
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Queue */}
      <div className="space-y-4">
        {filteredProducts?.map((product) => (
          <div key={product.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(product.priority)}`}>
                      {product.priority.charAt(0).toUpperCase() + product.priority.slice(1)} Priority
                    </span>
                    {product.flags?.length > 0 && (
                      <div className="flex gap-1">
                        {product.flags.map((flag, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded-full text-xs ${getFlagColor(flag)}`}>
                            <Icon name="ExclamationTriangleIcon" size={12} className="inline mr-1" />
                            {flag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>SKU: {product.sku}</span>
                    <span>•</span>
                    <Link href={`/admin-panel/vendors/${product.vendor_id}`} className="text-primary hover:underline">
                      {product.vendor_name}
                    </Link>
                    <span>•</span>
                    <span>{product.category}</span>
                    <span>•</span>
                    <span>Submitted: {formatDateTime(product.submitted_at)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="text-sm font-semibold text-foreground">{product.stock} units</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Images</p>
                      <p className="text-sm font-semibold text-foreground">{product.images?.length || 0} uploaded</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Product Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {product.images?.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <Icon name="PhotoIcon" size={32} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleReview(product)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="ClipboardDocumentCheckIcon" size={18} />
                  Review Product
                </button>
                <Link
                  href={`/product-details?id=${product.id}`}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Icon name="EyeIcon" size={18} />
                  Preview
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts?.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products in moderation queue</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Review Product</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-1 hover:bg-muted rounded-lg"
                >
                  <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{selectedProduct.name}</h4>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  <p className="text-muted-foreground">Vendor: {selectedProduct.vendor_name}</p>
                  <p className="text-muted-foreground">Category: {selectedProduct.category}</p>
                  <p className="text-muted-foreground">Price: {formatCurrency(selectedProduct.price)}</p>
                </div>
              </div>

              {selectedProduct.flags?.length > 0 && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <h4 className="font-semibold text-error mb-2 flex items-center gap-2">
                    <Icon name="ExclamationTriangleIcon" size={18} />
                    Flags Detected
                  </h4>
                  <ul className="space-y-1">
                    {selectedProduct.flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-error">
                        • {flag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason if rejecting this product..."
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

ModerationQueueInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    products: PropTypes.array
  })
};

'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function AllProductsInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      inactive: 'bg-error/10 text-error border-error/20',
      pending_approval: 'bg-warning/10 text-warning border-warning/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-error' };
    if (stock < 10) return { label: 'Low Stock', color: 'text-warning' };
    return { label: 'In Stock', color: 'text-success' };
  };

  // Get unique categories
  const categories = ['all', ...new Set(initialData?.products?.map(p => p.category) || [])];

  const filteredProducts = initialData?.products?.filter(product => {
    const statusMatch = selectedStatus === 'all' || product.status === selectedStatus;
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && categoryMatch && searchMatch;
  }) || [];

  const handleAction = (product, action) => {
    setSelectedProduct(product);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    const messages = {
      activate: `Product "${selectedProduct.name}" activated`,
      deactivate: `Product "${selectedProduct.name}" deactivated`,
      approve: `Product "${selectedProduct.name}" approved`,
      reject: `Product "${selectedProduct.name}" rejected`,
      delete: `Product "${selectedProduct.name}" deleted`
    };
    alert(messages[actionType] || 'Action completed');
    setShowActionModal(false);
  };

  return (
    <DashboardLayout
      role="admin"
      title="All Products"
      subtitle="Manage all marketplace products"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_products}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.active}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Inactive</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.inactive}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.pending_approval}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(initialData?.summary?.total_value)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or vendor..."
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending_approval">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">SKU</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Stock</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Performance</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Icon name="CubeIcon" size={24} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(product.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-mono text-foreground">{product.sku}</p>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin-panel/vendors/${product.vendor_id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {product.vendor_name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-foreground">{product.category}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</p>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.stock}</p>
                        <p className={`text-xs ${stockStatus.color}`}>{stockStatus.label}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                        {product.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Icon name="StarIcon" size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-foreground">{product.rating || 'N/A'}</span>
                          <span className="text-muted-foreground">({product.reviews_count})</span>
                        </div>
                        <p className="text-muted-foreground">{product.sales_count} sales</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {product.status === 'active' && (
                          <button
                            onClick={() => handleAction(product, 'deactivate')}
                            className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                            title="Deactivate"
                          >
                            <Icon name="XCircleIcon" size={16} />
                          </button>
                        )}
                        {product.status === 'inactive' && (
                          <button
                            onClick={() => handleAction(product, 'activate')}
                            className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                            title="Activate"
                          >
                            <Icon name="CheckCircleIcon" size={16} />
                          </button>
                        )}
                        {product.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleAction(product, 'approve')}
                              className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                              title="Approve"
                            >
                              <Icon name="CheckIcon" size={16} />
                            </button>
                            <button
                              onClick={() => handleAction(product, 'reject')}
                              className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                              title="Reject"
                            >
                              <Icon name="XMarkIcon" size={16} />
                            </button>
                          </>
                        )}
                        <Link
                          href={`/product-details?id=${product.id}`}
                          className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                          title="View Details"
                        >
                          <Icon name="EyeIcon" size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found matching your filters</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {actionType === 'activate' && 'Activate Product'}
                {actionType === 'deactivate' && 'Deactivate Product'}
                {actionType === 'approve' && 'Approve Product'}
                {actionType === 'reject' && 'Reject Product'}
                {actionType === 'delete' && 'Delete Product'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedProduct.name}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  <p className="text-muted-foreground">Vendor: {selectedProduct.vendor_name}</p>
                  <p className="text-muted-foreground">Price: {formatCurrency(selectedProduct.price)}</p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                actionType === 'deactivate' || actionType === 'reject' || actionType === 'delete'
                  ? 'bg-error/10 border-error/20' 
                  : 'bg-success/10 border-success/20'
              }`}>
                <p className="text-sm">
                  {actionType === 'activate' && 'This will make the product visible and available for purchase.'}
                  {actionType === 'deactivate' && 'This will hide the product from the marketplace.'}
                  {actionType === 'approve' && 'This will approve the product and make it active.'}
                  {actionType === 'reject' && 'This will reject the product submission.'}
                  {actionType === 'delete' && 'This action cannot be undone!'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  actionType === 'deactivate' || actionType === 'reject' || actionType === 'delete'
                    ? 'bg-error text-white hover:bg-error/90'
                    : 'bg-success text-white hover:bg-success/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

AllProductsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    products: PropTypes.array
  })
};

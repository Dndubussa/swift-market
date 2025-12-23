'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function CategoriesManagementInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active'
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      inactive: 'bg-error/10 text-error border-error/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredCategories = selectedStatus === 'all'
    ? initialData?.categories
    : initialData?.categories?.filter(c => c.status === selectedStatus) || [];

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormData({ name: '', slug: '', description: '', status: 'active' });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Name and slug are required');
      return;
    }
    alert(showAddModal ? `Category "${formData.name}" created!` : `Category "${formData.name}" updated!`);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleToggleStatus = (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    alert(`Category "${category.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Product Categories"
      subtitle="Manage product categories and hierarchies"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Categories</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_categories}</p>
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
          <p className="text-sm text-muted-foreground mb-1">Total Products</p>
          <p className="text-2xl font-bold text-primary">{initialData?.summary?.total_products}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
          >
            <Icon name="PlusIcon" size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories?.map((category) => (
          <div key={category.id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{category.slug}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(category.status)}`}>
                  {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Products</span>
                  <span className="text-sm font-semibold text-foreground">{category.product_count}</span>
                </div>

                {category.subcategories?.length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Subcategories ({category.subcategories.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 3).map((sub, idx) => (
                        <span key={idx} className="px-2 py-1 bg-background rounded text-xs text-foreground">
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="px-2 py-1 bg-background rounded text-xs text-muted-foreground">
                          +{category.subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Icon name="PencilIcon" size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(category)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                    category.status === 'active'
                      ? 'bg-error/10 text-error hover:bg-error/20'
                      : 'bg-success/10 text-success hover:bg-success/20'
                  }`}
                >
                  <Icon name={category.status === 'active' ? 'XCircleIcon' : 'CheckCircleIcon'} size={16} />
                  {category.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories?.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {showAddModal ? 'Add New Category' : 'Edit Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-1 hover:bg-muted rounded-lg"
                >
                  <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electronics"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., electronics"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90"
              >
                {showAddModal ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

CategoriesManagementInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    categories: PropTypes.array
  })
};

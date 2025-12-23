'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  updateProduct, 
  getProductById, 
  getCategories, 
  getVendorProfile,
  deleteProduct,
  uploadProductImage,
  setPrimaryImage
} from '@/lib/services/productService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function EditProductInteractive({ productId }) {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    sku: '',
    weight: '',
    dimensions: '',
    isActive: true,
    isFeatured: false
  });
  
  // Organize categories into parent/child structure
  const organizeCategories = (categories) => {
    const parents = categories.filter(cat => !cat.parent_id);
    const children = categories.filter(cat => cat.parent_id);
    
    return parents.map(parent => ({
      ...parent,
      children: children.filter(child => child.parent_id === parent.id)
    }));
  };
  
  // Filter categories based on product type (digital vs physical)
  const filterCategoriesByProductType = (categories, isDigital) => {
    // For editing, we need to determine if the product is digital based on the product data
    if (isDigital) {
      // For digital products, show only digital-friendly categories
      return categories.filter(cat => cat.is_digital_friendly !== false);
    } else {
      // For physical products, show only physical-friendly categories
      return categories.filter(cat => cat.is_physical_friendly !== false);
    }
  };
  
  // Determine if product is digital based on product data
  const isProductDigital = product?.is_digital || false;
  const filteredCategories = filterCategoriesByProductType(categories, isProductDigital);
  const organizedCategories = organizeCategories(filteredCategories);
  
  // Existing images from the database
  const [existingImages, setExistingImages] = useState([]);
  // New images to upload
  const [newImages, setNewImages] = useState([]);
  // Images marked for deletion
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/user-login');
        return;
      }
      
      if (userProfile?.role !== 'vendor') {
        router.push('/');
        return;
      }
      
      loadInitialData();
    }
  }, [user, userProfile, authLoading, router, productId]);

  const loadInitialData = async () => {
    try {
      const [vendorData, categoriesData, productData] = await Promise.all([
        getVendorProfile(user.id),
        getCategories(),
        getProductById(productId)
      ]);
      
      setVendorProfile(vendorData);
      setCategories(categoriesData);
      
      if (productData) {
        // Verify this product belongs to the vendor
        if (productData.vendor_id !== vendorData?.id) {
          alert('You do not have permission to edit this product');
          router.push('/vendor-store-management');
          return;
        }
        
        setProduct(productData);
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price?.toString() || '',
          compareAtPrice: productData.compare_at_price?.toString() || '',
          categoryId: productData.category_id || '',
          stockQuantity: productData.stock_quantity?.toString() || '',
          lowStockThreshold: productData.low_stock_threshold?.toString() || '10',
          sku: productData.sku || '',
          weight: productData.weight?.toString() || '',
          dimensions: productData.dimensions || '',
          isActive: productData.is_active ?? true,
          isFeatured: productData.is_featured ?? false
        });
        
        // Sort images by display_order and is_primary
        const sortedImages = (productData.images || []).sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.display_order - b.display_order;
        });
        setExistingImages(sortedImages);
      } else {
        alert('Product not found');
        router.push('/vendor-store-management');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (formData.compareAtPrice && parseFloat(formData.compareAtPrice) <= parseFloat(formData.price)) {
      newErrors.compareAtPrice = 'Compare at price should be higher than the selling price';
    }
    
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required';
    }
    
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length;
    if (totalImages === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    const maxImages = 6;
    
    const currentCount = existingImages.length - imagesToDelete.length + newImages.length;
    
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }
      return true;
    });
    
    const remainingSlots = maxImages - currentCount;
    if (validFiles.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s)`);
    }
    
    setNewImages(prev => [...prev, ...validFiles.slice(0, remainingSlots)]);
  };

  const handleRemoveExistingImage = (imageId, imageUrl) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = async (imageId) => {
    const success = await setPrimaryImage(productId, imageId);
    if (success) {
      setExistingImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })).sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.display_order - b.display_order;
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        vendorId: vendorProfile.id
      };
      
      const result = await updateProduct(productId, productData, newImages, imagesToDelete);
      
      if (result.success) {
        alert('Product updated successfully!');
        router.push('/vendor-store-management');
      } else {
        alert(`Error updating product: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred while updating the product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const result = await deleteProduct(productId);
      
      if (result.success) {
        alert('Product deleted successfully!');
        router.push('/vendor-store-management');
      } else {
        alert(`Error deleting product: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ExclamationTriangleIcon" size={48} className="text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Product Not Found</h2>
          <Link href="/vendor-store-management" className="text-primary hover:underline">
            Go back to Store Management
          </Link>
        </div>
      </div>
    );
  }

  const getImagePreview = (file) => URL.createObjectURL(file);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/vendor-store-management"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="ArrowLeftIcon" size={20} className="text-foreground" />
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Edit Product</h1>
                <p className="text-muted-foreground mt-1">Update your product listing</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Icon name="TrashIcon" size={18} />
              )}
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Images */}
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Product Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image) => (
                    <div 
                      key={image.id}
                      className={`relative group rounded-lg overflow-hidden bg-muted border-2 ${
                        image.is_primary ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <div className="aspect-square">
                        <AppImage
                          src={image.image_url}
                          alt={image.alt_text || 'Product image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                          Primary
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(image.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title="Set as primary"
                          >
                            <Icon name="StarIcon" size={18} className="text-white" />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(image.id, image.image_url)}
                          className="p-2 bg-error/80 hover:bg-error rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Icon name="TrashIcon" size={18} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">New Images to Upload</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div 
                      key={index}
                      className="relative group rounded-lg overflow-hidden bg-muted border-2 border-success/50"
                    >
                      <div className="aspect-square">
                        <AppImage
                          src={getImagePreview(file)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute top-2 left-2 px-2 py-1 bg-success text-white rounded text-xs font-medium">
                        New
                      </div>
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="p-2 bg-error/80 hover:bg-error rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Icon name="TrashIcon" size={18} className="text-white" />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-xs truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-2">
                <Icon name="PlusIcon" size={18} />
                Add Images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleNewImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-muted-foreground">
                {existingImages.length + newImages.length} of 6 images
              </p>
            </div>
            
            {errors.images && (
              <p className="text-error text-sm mt-2 flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={16} />
                {errors.images}
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Product Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-foreground mb-1">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.categoryId ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                >
                  <option value="">Select a category</option>
                  {organizedCategories.map((category) => [
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>,
                    category.children && category.children.map((child) => (
                      <option key={child.id} value={child.id}>
                        &nbsp;&nbsp;─ {child.name}
                      </option>
                    ))
                  ])}
                </select>
                {errors.categoryId && <p className="text-error text-sm mt-1">{errors.categoryId}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                  Price (TZS) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">TZS</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-14 pr-4 py-2 rounded-lg border ${errors.price ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                </div>
                {errors.price && <p className="text-error text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-foreground mb-1">
                  Compare at Price (TZS)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">TZS</span>
                  <input
                    type="number"
                    id="compareAtPrice"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-14 pr-4 py-2 rounded-lg border ${errors.compareAtPrice ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                  />
                </div>
                {errors.compareAtPrice && <p className="text-error text-sm mt-1">{errors.compareAtPrice}</p>}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-foreground mb-1">
                  Stock Quantity <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-2 rounded-lg border ${errors.stockQuantity ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.stockQuantity && <p className="text-error text-sm mt-1">{errors.stockQuantity}</p>}
              </div>

              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-foreground mb-1">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-foreground mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Shipping</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-foreground mb-1">
                  Dimensions (L x W x H cm)
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Visibility</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <div>
                  <span className="font-medium text-foreground">Active</span>
                  <p className="text-sm text-muted-foreground">Product will be visible in the marketplace</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <div>
                  <span className="font-medium text-foreground">Featured</span>
                  <p className="text-sm text-muted-foreground">Show product in featured sections</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/vendor-store-management"
              className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-center font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-card disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Icon name="CheckIcon" size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditProductInteractive.propTypes = {
  productId: PropTypes.string.isRequired
};


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createProduct, createDigitalProduct, getCategories, getVendorProfile } from '@/lib/services/productService';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';
import ProductImageUpload from './ProductImageUpload';
import DigitalFileUpload from './DigitalFileUpload';

export default function AddProductInteractive() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('type');
  
  // Section refs for scroll tracking
  const sectionRefs = {
    type: useRef(null),
    images: useRef(null),
    files: useRef(null),
    settings: useRef(null),
    info: useRef(null),
    pricing: useRef(null),
    inventory: useRef(null),
    shipping: useRef(null),
    visibility: useRef(null),
  };
  
  // Product type
  const [isDigital, setIsDigital] = useState(false);
  
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
    if (isDigital) {
      // For digital products, show only digital-friendly categories
      return categories.filter(cat => cat.is_digital_friendly !== false);
    } else {
      // For physical products, show only physical-friendly categories
      return categories.filter(cat => cat.is_physical_friendly !== false);
    }
  };
  
  const filteredCategories = filterCategoriesByProductType(categories, isDigital);
  const organizedCategories = organizeCategories(filteredCategories);
  
  // Digital product settings
  const [digitalSettings, setDigitalSettings] = useState({
    maxDownloads: '5',
    downloadExpiryDays: '30',
    allowMultipleDevices: true
  });
  
  const [images, setImages] = useState([]);
  const [digitalFiles, setDigitalFiles] = useState([]);

  // Navigation steps
  const getSteps = () => {
    const baseSteps = [
      { id: 'type', label: 'Product Type', icon: 'TagIcon', completed: true },
      { id: 'images', label: isDigital ? 'Cover Images' : 'Product Images', icon: 'PhotoIcon', completed: images.length > 0 },
    ];
    
    if (isDigital) {
      baseSteps.push(
        { id: 'files', label: 'Digital Files', icon: 'DocumentIcon', completed: digitalFiles.length > 0 },
        { id: 'settings', label: 'Download Settings', icon: 'Cog6ToothIcon', completed: true }
      );
    }
    
    baseSteps.push(
      { id: 'info', label: 'Basic Information', icon: 'InformationCircleIcon', completed: formData.name.trim() !== '' },
      { id: 'pricing', label: 'Pricing', icon: 'CurrencyDollarIcon', completed: formData.price !== '' }
    );
    
    if (!isDigital) {
      baseSteps.push(
        { id: 'inventory', label: 'Inventory', icon: 'ArchiveBoxIcon', completed: formData.stockQuantity !== '' },
        { id: 'shipping', label: 'Shipping', icon: 'TruckIcon', completed: true }
      );
    }
    
    baseSteps.push(
      { id: 'visibility', label: 'Visibility', icon: 'EyeIcon', completed: true }
    );
    
    return baseSteps;
  };

  const scrollToSection = (sectionId) => {
    sectionRefs[sectionId]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sectionId);
  };

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
  }, [user, userProfile, authLoading, router]);

  const loadInitialData = async () => {
    try {
      const [vendorData, categoriesData] = await Promise.all([
        getVendorProfile(user.id),
        getCategories()
      ]);
      
      setVendorProfile(vendorData);
      setCategories(categoriesData);
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

  const handleDigitalSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDigitalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    
    if (!isDigital) {
      if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
        newErrors.stockQuantity = 'Valid stock quantity is required';
      }
    }
    
    if (isDigital) {
      if (digitalFiles.length === 0) {
        newErrors.digitalFiles = 'At least one digital file is required';
      }
      
      if (!digitalSettings.maxDownloads || parseInt(digitalSettings.maxDownloads) < 1) {
        newErrors.maxDownloads = 'Max downloads must be at least 1';
      }
      
      if (!digitalSettings.downloadExpiryDays || parseInt(digitalSettings.downloadExpiryDays) < 1) {
        newErrors.downloadExpiryDays = 'Download expiry must be at least 1 day';
      }
    }
    
    if (images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      
      let result;
      
      if (isDigital) {
        result = await createDigitalProduct(
          productData, 
          images, 
          digitalFiles,
          {
            maxDownloads: parseInt(digitalSettings.maxDownloads),
            downloadExpiryDays: parseInt(digitalSettings.downloadExpiryDays),
            allowMultipleDevices: digitalSettings.allowMultipleDevices
          }
        );
      } else {
        result = await createProduct(productData, images);
      }
      
      if (result.success) {
        alert(`${isDigital ? 'Digital product' : 'Product'} created successfully!`);
        router.push('/vendor-store-management');
      } else {
        alert(`Error creating product: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('An error occurred while creating the product');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="vendor" title={`Add ${isDigital ? 'Digital Product' : 'Product'}`} subtitle="Fill in the details below">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendorProfile) {
    return (
      <DashboardLayout role="vendor" title={`Add ${isDigital ? 'Digital Product' : 'Product'}`} subtitle="Fill in the details below">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Icon name="ExclamationTriangleIcon" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Vendor Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">Please complete your vendor profile setup first.</p>
            <Link href="/vendor-store-management" className="text-primary hover:underline">
              Go to Store Management
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const steps = getSteps();
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <DashboardLayout role="vendor" title={`Add ${isDigital ? 'Digital Product' : 'Product'}`} subtitle="Fill in the details below">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border shadow-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/vendor-store-management"
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="ArrowLeftIcon" size={20} className="text-foreground" />
                </Link>
                <div>
                  <h1 className="text-xl font-heading font-bold text-foreground">
                    Add {isDigital ? 'Digital Product' : 'Product'}
                  </h1>
                  <p className="text-sm text-muted-foreground">Fill in the details below</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {completedSteps}/{steps.length} completed
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-card rounded-lg border border-border shadow-card p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Steps
                  </h3>
                  <nav className="space-y-1">
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => scrollToSection(step.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          activeSection === step.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          step.completed
                            ? 'bg-success text-white'
                            : activeSection === step.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {step.completed ? (
                            <Icon name="CheckIcon" size={14} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="truncate">{step.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Quick Summary */}
                <div className="bg-card rounded-lg border border-border shadow-card p-4 mt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium text-foreground">
                        {isDigital ? 'Digital' : 'Physical'}
                      </span>
                    </div>
                    {formData.name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {formData.name}
                        </span>
                      </div>
                    )}
                    {formData.price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium text-foreground">
                          TZS {parseFloat(formData.price).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images</span>
                      <span className="font-medium text-foreground">{images.length}</span>
                    </div>
                    {isDigital && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Files</span>
                        <span className="font-medium text-foreground">{digitalFiles.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Product Type Selection */}
                <div ref={sectionRefs.type} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="TagIcon" size={20} className="text-primary" />
                    Product Type
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsDigital(false)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        !isDigital 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${!isDigital ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Icon name="CubeIcon" size={24} className={!isDigital ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <span className="font-semibold text-foreground">Physical Product</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tangible items that require shipping
                      </p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsDigital(true)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isDigital 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isDigital ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Icon name="CloudArrowDownIcon" size={24} className={isDigital ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <span className="font-semibold text-foreground">Digital Product</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        E-books, PDFs, music, software, courses
                      </p>
                    </button>
                  </div>
                </div>

                {/* Product Images */}
                <div ref={sectionRefs.images} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                  <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Icon name="PhotoIcon" size={20} className="text-primary" />
                    {isDigital ? 'Cover Images' : 'Product Images'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isDigital 
                      ? 'Upload cover images for your digital product'
                      : 'Upload photos of your product from different angles'}
                  </p>
                  <ProductImageUpload 
                    images={images} 
                    setImages={setImages} 
                    error={errors.images}
                  />
                </div>

                {/* Digital Files Upload */}
                {isDigital && (
                  <div ref={sectionRefs.files} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                    <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Icon name="DocumentIcon" size={20} className="text-primary" />
                      Digital Files
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload files customers will download after purchase (max 100MB each)
                    </p>
                    <DigitalFileUpload 
                      files={digitalFiles} 
                      setFiles={setDigitalFiles} 
                      error={errors.digitalFiles}
                    />
                  </div>
                )}

                {/* Digital Product Settings */}
                {isDigital && (
                  <div ref={sectionRefs.settings} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="Cog6ToothIcon" size={20} className="text-primary" />
                      Download Settings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="maxDownloads" className="block text-sm font-medium text-foreground mb-1">
                          Max Downloads per Purchase
                        </label>
                        <input
                          type="number"
                          id="maxDownloads"
                          name="maxDownloads"
                          value={digitalSettings.maxDownloads}
                          onChange={handleDigitalSettingsChange}
                          min="1"
                          max="100"
                          className={`w-full px-4 py-2 rounded-lg border ${errors.maxDownloads ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                        />
                        {errors.maxDownloads && <p className="text-error text-sm mt-1">{errors.maxDownloads}</p>}
                      </div>

                      <div>
                        <label htmlFor="downloadExpiryDays" className="block text-sm font-medium text-foreground mb-1">
                          Link Expiry (Days)
                        </label>
                        <input
                          type="number"
                          id="downloadExpiryDays"
                          name="downloadExpiryDays"
                          value={digitalSettings.downloadExpiryDays}
                          onChange={handleDigitalSettingsChange}
                          min="1"
                          max="365"
                          className={`w-full px-4 py-2 rounded-lg border ${errors.downloadExpiryDays ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                        />
                        {errors.downloadExpiryDays && <p className="text-error text-sm mt-1">{errors.downloadExpiryDays}</p>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="allowMultipleDevices"
                          checked={digitalSettings.allowMultipleDevices}
                          onChange={handleDigitalSettingsChange}
                          className="w-5 h-5 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">Allow downloads from multiple devices</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div ref={sectionRefs.info} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="InformationCircleIcon" size={20} className="text-primary" />
                    Basic Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                        {isDigital ? 'Title' : 'Product Name'} <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                        placeholder={isDigital ? 'e.g., Complete Guide to Digital Marketing' : 'Enter product name'}
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
                        placeholder={isDigital 
                          ? 'Describe what buyers will learn or receive...'
                          : 'Describe your product in detail...'}
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
                <div ref={sectionRefs.pricing} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="CurrencyDollarIcon" size={20} className="text-primary" />
                    Pricing
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                        Price (TZS) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">TZS</span>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className={`w-full pl-12 pr-4 py-2 rounded-lg border ${errors.price ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && <p className="text-error text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <label htmlFor="compareAtPrice" className="block text-sm font-medium text-foreground mb-1">
                        Compare at Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">TZS</span>
                        <input
                          type="number"
                          id="compareAtPrice"
                          name="compareAtPrice"
                          value={formData.compareAtPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className={`w-full pl-12 pr-4 py-2 rounded-lg border ${errors.compareAtPrice ? 'border-error' : 'border-input'} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.compareAtPrice && <p className="text-error text-sm mt-1">{errors.compareAtPrice}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Original price before discount</p>
                    </div>
                  </div>
                </div>

                {/* Inventory (Physical only) */}
                {!isDigital && (
                  <div ref={sectionRefs.inventory} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="ArchiveBoxIcon" size={20} className="text-primary" />
                      Inventory
                    </h2>
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
                          placeholder="0"
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
                          placeholder="10"
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
                          placeholder="PROD-001"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping (Physical only) */}
                {!isDigital && (
                  <div ref={sectionRefs.shipping} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="TruckIcon" size={20} className="text-primary" />
                      Shipping
                    </h2>
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
                          placeholder="0.00"
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
                          placeholder="30 x 20 x 10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Visibility */}
                <div ref={sectionRefs.visibility} className="bg-card rounded-lg border border-border shadow-card p-6 scroll-mt-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="EyeIcon" size={20} className="text-primary" />
                    Visibility
                  </h2>
                  <div className="flex flex-wrap gap-6">
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
                        <p className="text-xs text-muted-foreground">Visible in marketplace</p>
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
                        <p className="text-xs text-muted-foreground">Show in featured sections</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-card rounded-lg border border-border shadow-card p-4 sticky bottom-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {completedSteps === steps.length ? (
                        <span className="text-success flex items-center gap-1">
                          <Icon name="CheckCircleIcon" size={16} />
                          All steps completed
                        </span>
                      ) : (
                        `${steps.length - completedSteps} steps remaining`
                      )}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href="/vendor-store-management"
                        className="px-5 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-card disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Icon name="PlusIcon" size={18} />
                            Create {isDigital ? 'Digital Product' : 'Product'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
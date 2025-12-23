'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useAuth } from '@/contexts/AuthContext';
import { getProductsByVendor, getVendorProfile, deleteProduct } from '@/lib/services/productService';
import { DashboardLayout } from '@/components/dashboard';
import StoreProfileSection from './StoreProfileSection';
import ProductInventoryTable from './ProductInventoryTable';
import StoreCustomizationPanel from './StoreCustomizationPanel';
import BusinessSettingsPanel from './BusinessSettingsPanel';
import StoreAnalyticsDashboard from './StoreAnalyticsDashboard';
import VerificationStatusCard from './VerificationStatusCard';
import Icon from '@/components/ui/AppIcon';

export default function VendorStoreManagementInteractive({ initialData }) {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [storeData, setStoreData] = useState(initialData?.storeProfile);
  const [products, setProducts] = useState([]);
  const [customization, setCustomization] = useState(initialData?.customization);
  const [businessSettings, setBusinessSettings] = useState(initialData?.businessSettings);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load vendor data on mount
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
      
      loadVendorData();
    }
  }, [user, userProfile, authLoading, router]);

  const loadVendorData = async () => {
    try {
      // Get vendor profile
      const vendor = await getVendorProfile(user.id);
      if (!vendor) {
        console.error('No vendor profile found');
        setLoading(false);
        return;
      }
      
      setVendorProfile(vendor);
      
      // Update store data with vendor info
      setStoreData(prev => ({
        ...prev,
        storeName: vendor.business_name || 'Your Store',
        description: vendor.business_description || '',
        email: vendor.business_email || '',
        phone: vendor.business_phone || '',
        address: vendor.business_address || '',
        isVerified: vendor.is_verified || false
      }));
      
      // Fetch vendor's products
      const { products: vendorProducts } = await getProductsByVendor(vendor.id);
      
      // Transform products for the ProductInventoryTable component
      const transformedProducts = vendorProducts.map(product => {
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        return {
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
          price: `TZS ${parseFloat(product.price).toLocaleString()}`,
          stock: product.stock_quantity,
          category: product.category?.name || 'Uncategorized',
          image: primaryImage?.image_url || '/no_image.png',
          alt: primaryImage?.alt_text || product.name
        };
      });
      
      setProducts(transformedProducts);
      
      // Update store profile with actual product count
      setStoreData(prev => ({
        ...prev,
        totalProducts: transformedProducts.length
      }));
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = (updatedData) => {
    setStoreData(prev => ({ ...prev, ...updatedData }));
    alert('Store profile updated successfully!');
  };

  const handleBulkAction = async (action, productIds) => {
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${productIds?.length} product(s)?`)) {
        // Delete products from database
        let deletedCount = 0;
        for (const productId of productIds) {
          const result = await deleteProduct(productId);
          if (result.success) {
            deletedCount++;
          }
        }
        
        // Update local state
        setProducts(prev => prev?.filter(p => !productIds?.includes(p?.id)));
        
        if (deletedCount === productIds.length) {
          alert('Products deleted successfully!');
        } else {
          alert(`${deletedCount} of ${productIds.length} products deleted. Some deletions may have failed.`);
        }
      }
    } else if (action === 'edit') {
      // Single product edit - redirect to edit page
      if (productIds?.length === 1) {
        router.push(`/vendor-store-management/edit-product/${productIds[0]}`);
      }
    }
  };

  const handleCustomizationSave = (updatedCustomization) => {
    setCustomization(updatedCustomization);
    alert('Store customization saved successfully!');
  };

  const handleBusinessSettingsSave = (updatedSettings) => {
    setBusinessSettings(updatedSettings);
    alert('Business settings saved successfully!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'HomeIcon' },
    { id: 'products', label: 'Products', icon: 'ShoppingBagIcon' },
    { id: 'customization', label: 'Customization', icon: 'PaintBrushIcon' },
    { id: 'settings', label: 'Settings', icon: 'Cog6ToothIcon' },
    { id: 'analytics', label: 'Analytics', icon: 'ChartBarIcon' }
  ];

  if (authLoading || loading) {
    return (
      <DashboardLayout role="vendor" title="Store Management" subtitle="Manage your store, products, and settings">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading store management...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="vendor" title="Store Management" subtitle="Manage your store, products, and settings">
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="bg-card border-b border-border shadow-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Store Management</h1>
                <p className="text-muted-foreground mt-1">Manage your store, products, and settings</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200 flex items-center gap-2">
                  <Icon name="EyeIcon" size={18} />
                  <span className="hidden sm:inline">Preview Store</span>
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 shadow-card">
                  <Icon name="ArrowUpTrayIcon" size={18} />
                  <span className="hidden sm:inline">Publish Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Tabs */}
        <div className="bg-card border-b border-border sticky top-16 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StoreProfileSection storeData={storeData} onUpdate={handleStoreUpdate} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <StoreAnalyticsDashboard analytics={initialData?.analytics} />
                </div>
                <div>
                  <VerificationStatusCard verification={initialData?.verification} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductInventoryTable products={products} onBulkAction={handleBulkAction} />
          )}

          {activeTab === 'customization' && (
            <StoreCustomizationPanel customization={customization} onSave={handleCustomizationSave} />
          )}

          {activeTab === 'settings' && (
            <BusinessSettingsPanel settings={businessSettings} onSave={handleBusinessSettingsSave} />
          )}

          {activeTab === 'analytics' && (
            <StoreAnalyticsDashboard analytics={initialData?.analytics} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

VendorStoreManagementInteractive.propTypes = {
  initialData: PropTypes?.shape({
    storeProfile: PropTypes?.object?.isRequired,
    products: PropTypes?.array?.isRequired,
    customization: PropTypes?.object?.isRequired,
    businessSettings: PropTypes?.object?.isRequired,
    analytics: PropTypes?.object?.isRequired,
    verification: PropTypes?.object?.isRequired
  })?.isRequired
};
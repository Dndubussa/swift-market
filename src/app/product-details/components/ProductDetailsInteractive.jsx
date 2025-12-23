'use client';

import { useState } from 'react';
import ProductImageGallery from './ProductImageGallery';
import ProductInfoSection from './ProductInfoSection';
import VendorInfoCard from './VendorInfoCard';
import PurchasePanel from './PurchasePanel';
import ReviewsSection from './ReviewsSection';
import RelatedProducts from './RelatedProducts';

export default function ProductDetailsInteractive({ productData, vendorData, reviewsData, relatedProductsData }) {
  const [cartItemCount] = useState(3);

  const handleLogout = () => {
    console.log('User logged out');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <a href="/product-catalog" className="hover:text-primary transition-colors duration-200">
            Shop
          </a>
          <span>/</span>
          <a href="/product-catalog" className="hover:text-primary transition-colors duration-200">
            {productData?.category}
          </a>
          <span>/</span>
          <span className="text-foreground font-medium">{productData?.title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <ProductImageGallery images={productData?.images} />
          </div>

          {/* Middle Column - Product Info */}
          <div className="lg:col-span-1">
            <ProductInfoSection product={productData} />
          </div>

          {/* Right Column - Purchase Panel & Vendor */}
          <div className="lg:col-span-1 space-y-6">
            <PurchasePanel product={productData} variants={productData?.variants} />
            <VendorInfoCard vendor={vendorData} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ReviewsSection
            productId={productData?.id}
            averageRating={reviewsData?.averageRating}
            totalReviews={reviewsData?.totalReviews}
          />
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <RelatedProducts
            products={relatedProductsData?.sameVendor}
            title="More from this Vendor"
          />
        </div>

        {/* Similar Products */}
        <div>
          <RelatedProducts
            products={relatedProductsData?.similar}
            title="Similar Products"
          />
        </div>
      </div>
    </div>
  );
}
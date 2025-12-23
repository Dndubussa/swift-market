'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import FilterPanel from './FilterPanel';
import SortControls from './SortControls';
import ProductGrid from './ProductGrid';
import LoadingState from './LoadingState';

function ProductCatalogContent({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [products, setProducts] = useState(initialData?.products);
  const [filteredProducts, setFilteredProducts] = useState(initialData?.products);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000000],
    vendors: [],
    minRating: 0,
    locations: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const cart = JSON.parse(storedCart);
      setCartItemCount(cart?.length);
    }

    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      setWishlistItems(JSON.parse(storedWishlist));
    }

    const searchQuery = searchParams?.get('search');
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = (query) => {
    const searchResults = products?.filter(product =>
      product?.name?.toLowerCase()?.includes(query?.toLowerCase()) ||
      product?.vendor?.name?.toLowerCase()?.includes(query?.toLowerCase())
    );
    setFilteredProducts(searchResults);
  };

  const applyFilters = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...products];

      if (filters?.categories?.length > 0) {
        filtered = filtered?.filter(product =>
          filters?.categories?.includes(product?.categoryId)
        );
      }

      if (filters?.priceRange) {
        filtered = filtered?.filter(product =>
          product?.price >= filters?.priceRange?.[0] &&
          product?.price <= filters?.priceRange?.[1]
        );
      }

      if (filters?.vendors?.length > 0) {
        filtered = filtered?.filter(product =>
          filters?.vendors?.includes(product?.vendor?.id)
        );
      }

      if (filters?.minRating > 0) {
        filtered = filtered?.filter(product =>
          product?.rating >= filters?.minRating
        );
      }

      if (filters?.locations?.length > 0) {
        filtered = filtered?.filter(product =>
          filters?.locations?.includes(product?.vendor?.location)
        );
      }

      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 300);
  }, [filters, products]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clear') {
      setFilters({
        categories: [],
        priceRange: [0, 1000000],
        vendors: [],
        minRating: 0,
        locations: [],
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: value,
      }));
    }
  };

  const handleSortChange = (sortType) => {
    setCurrentSort(sortType);
    let sorted = [...filteredProducts];

    switch (sortType) {
      case 'price-low':
        sorted?.sort((a, b) => a?.price - b?.price);
        break;
      case 'price-high':
        sorted?.sort((a, b) => b?.price - a?.price);
        break;
      case 'rating':
        sorted?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'newest':
        sorted?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  const handleAddToCart = (productId) => {
    const storedCart = localStorage.getItem('cart');
    const cart = storedCart ? JSON.parse(storedCart) : [];
    
    const existingItem = cart?.find(item => item?.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart?.push({ productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartItemCount(cart?.length);
  };

  const handleToggleWishlist = (productId) => {
    const storedWishlist = localStorage.getItem('wishlist');
    let wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
    
    if (wishlist?.includes(productId)) {
      wishlist = wishlist?.filter(id => id !== productId);
    } else {
      wishlist?.push(productId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    setWishlistItems(wishlist);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Product Catalog</h1>
          <p className="text-muted-foreground">Discover products from verified vendors across Tanzania</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Panel */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={initialData?.categories}
                vendors={initialData?.vendors}
                locations={initialData?.locations}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200"
              >
                <Icon name="AdjustmentsHorizontalIcon" size={20} />
                <span className="font-medium">Filters</span>
              </button>
            </div>

            <SortControls
              currentSort={currentSort}
              onSortChange={handleSortChange}
              resultCount={filteredProducts?.length}
            />

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <LoadingState />
              ) : (
                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistItems={wishlistItems}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Mobile Filter Panel Overlay */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setIsFilterPanelOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-card shadow-modal animate-slide-in-left">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={initialData?.categories}
              vendors={initialData?.vendors}
              locations={initialData?.locations}
              isMobile={true}
              onClose={() => setIsFilterPanelOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

ProductCatalogContent.propTypes = {
  initialData: PropTypes?.shape({
    products: PropTypes?.array?.isRequired,
    categories: PropTypes?.array?.isRequired,
    vendors: PropTypes?.array?.isRequired,
    locations: PropTypes?.array?.isRequired,
  })?.isRequired,
};

export default function ProductCatalogInteractive({ initialData }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground">Loading...</div></div>}>
      <ProductCatalogContent initialData={initialData} />
    </Suspense>
  );
}

ProductCatalogInteractive.propTypes = {
  initialData: PropTypes?.shape({
    products: PropTypes?.array?.isRequired,
    categories: PropTypes?.array?.isRequired,
    vendors: PropTypes?.array?.isRequired,
    locations: PropTypes?.array?.isRequired,
  })?.isRequired,
};
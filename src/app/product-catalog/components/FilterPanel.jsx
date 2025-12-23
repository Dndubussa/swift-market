'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  categories, 
  vendors, 
  locations,
  isMobile = false,
  onClose 
}) {
  const [priceRange, setPriceRange] = useState(filters?.priceRange || [0, 1000000]);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    vendor: false,
    rating: true,
    location: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section],
    }));
  };

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(value);
    setPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    onFilterChange('priceRange', priceRange);
  };

  const handleCategoryToggle = (categoryId) => {
    const currentCategories = filters?.categories || [];
    const newCategories = currentCategories?.includes(categoryId)
      ? currentCategories?.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    onFilterChange('categories', newCategories);
  };

  const handleVendorToggle = (vendorId) => {
    const currentVendors = filters?.vendors || [];
    const newVendors = currentVendors?.includes(vendorId)
      ? currentVendors?.filter(id => id !== vendorId)
      : [...currentVendors, vendorId];
    onFilterChange('vendors', newVendors);
  };

  const handleLocationToggle = (location) => {
    const currentLocations = filters?.locations || [];
    const newLocations = currentLocations?.includes(location)
      ? currentLocations?.filter(loc => loc !== location)
      : [...currentLocations, location];
    onFilterChange('locations', newLocations);
  };

  const handleRatingChange = (rating) => {
    onFilterChange('minRating', filters?.minRating === rating ? 0 : rating);
  };

  const clearAllFilters = () => {
    onFilterChange('clear', null);
    setPriceRange([0, 1000000]);
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="font-semibold text-foreground">{title}</span>
        <Icon
          name="ChevronDownIcon"
          size={20}
          className={`text-muted-foreground transition-transform duration-200 ${
            expandedSections?.[section] ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedSections?.[section] && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );

  return (
    <div className={`bg-card ${isMobile ? 'h-full overflow-y-auto' : 'border border-border rounded-lg'} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <h2 className="text-lg font-heading font-bold text-foreground">Filters</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Clear All
          </button>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded transition-colors duration-200"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {/* Categories */}
        <FilterSection title="Categories" section="category">
          <div className="space-y-2">
            {categories?.map((category) => (
              <label key={category?.id} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters?.categories || [])?.includes(category?.id)}
                  onChange={() => handleCategoryToggle(category?.id)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                  {category?.name} ({category?.count})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" section="price">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={priceRange?.[0]}
                onChange={(e) => handlePriceChange(0, e?.target?.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Min"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="number"
                value={priceRange?.[1]}
                onChange={(e) => handlePriceChange(1, e?.target?.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Max"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
            >
              Apply
            </button>
          </div>
        </FilterSection>

        {/* Vendors */}
        <FilterSection title="Vendors" section="vendor">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vendors?.map((vendor) => (
              <label key={vendor?.id} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters?.vendors || [])?.includes(vendor?.id)}
                  onChange={() => handleVendorToggle(vendor?.id)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                  {vendor?.name} ({vendor?.productCount})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Minimum Rating" section="rating">
          <div className="space-y-2">
            {[4, 3, 2, 1]?.map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                  filters?.minRating === rating
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center">
                  {[...Array(5)]?.map((_, index) => (
                    <Icon
                      key={index}
                      name="StarIcon"
                      size={16}
                      variant={index < rating ? 'solid' : 'outline'}
                      className={index < rating ? 'text-accent' : 'text-muted'}
                    />
                  ))}
                </div>
                <span className="text-sm">& Up</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location" section="location">
          <div className="space-y-2">
            {locations?.map((location) => (
              <label key={location} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters?.locations || [])?.includes(location)}
                  onChange={() => handleLocationToggle(location)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                  {location}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  filters: PropTypes?.shape({
    categories: PropTypes?.arrayOf(PropTypes?.string),
    priceRange: PropTypes?.arrayOf(PropTypes?.number),
    vendors: PropTypes?.arrayOf(PropTypes?.string),
    minRating: PropTypes?.number,
    locations: PropTypes?.arrayOf(PropTypes?.string),
  })?.isRequired,
  onFilterChange: PropTypes?.func?.isRequired,
  categories: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired,
      count: PropTypes?.number?.isRequired,
    })
  )?.isRequired,
  vendors: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired,
      productCount: PropTypes?.number?.isRequired,
    })
  )?.isRequired,
  locations: PropTypes?.arrayOf(PropTypes?.string)?.isRequired,
  isMobile: PropTypes?.bool,
  onClose: PropTypes?.func,
};
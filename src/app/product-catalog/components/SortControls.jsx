'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function SortControls({ currentSort, onSortChange, resultCount }) {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: 'SparklesIcon' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUpIcon' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDownIcon' },
    { value: 'rating', label: 'Highest Rated', icon: 'StarIcon' },
    { value: 'newest', label: 'Newest First', icon: 'ClockIcon' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <Icon name="AdjustmentsHorizontalIcon" size={20} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'product' : 'products'} found
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground hidden sm:block">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions?.map((option) => (
            <button
              key={option?.value}
              onClick={() => onSortChange(option?.value)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentSort === option?.value
                  ? 'bg-primary text-primary-foreground shadow-card'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={option?.icon} size={16} />
              <span>{option?.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

SortControls.propTypes = {
  currentSort: PropTypes?.string?.isRequired,
  onSortChange: PropTypes?.func?.isRequired,
  resultCount: PropTypes?.number?.isRequired,
};
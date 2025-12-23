import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function WishlistPreview({ wishlistItems }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">
          Wishlist
        </h2>
        <Link 
          href="/product-catalog?view=wishlist" 
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          View All
          <Icon name="ChevronRightIcon" size={16} />
        </Link>
      </div>
      <div className="space-y-3">
        {wishlistItems?.map((item) => (
          <Link 
            key={item?.id} 
            href={`/product-details?id=${item?.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200 group"
          >
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
              <AppImage
                src={item?.image}
                alt={item?.imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {item?.name}
              </p>
              <p className="text-sm font-bold text-foreground mb-1">
                TZS {item?.price?.toLocaleString()}
              </p>
              {item?.priceChange && (
                <div className="flex items-center gap-1">
                  <Icon 
                    name={item?.priceChange > 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
                    size={12} 
                    className={item?.priceChange > 0 ? 'text-error' : 'text-success'} 
                  />
                  <span className={`text-xs font-medium ${item?.priceChange > 0 ? 'text-error' : 'text-success'}`}>
                    {Math.abs(item?.priceChange)}% {item?.priceChange > 0 ? 'increase' : 'decrease'}
                  </span>
                </div>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-error/10 transition-colors duration-200">
              <Icon name="HeartIcon" size={20} className="text-error fill-error" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

WishlistPreview.propTypes = {
  wishlistItems: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      image: PropTypes?.string?.isRequired,
      imageAlt: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired,
      price: PropTypes?.number?.isRequired,
      priceChange: PropTypes?.number
    })
  )?.isRequired
};
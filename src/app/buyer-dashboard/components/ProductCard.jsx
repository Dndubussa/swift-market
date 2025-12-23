import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function ProductCard({ product }) {
  return (
    <Link href={`/product-details?id=${product?.id}`} className="block">
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-all duration-200 group">
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <AppImage
            src={product?.image}
            alt={product?.imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {product?.discount && (
            <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-bold">
              -{product?.discount}%
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product?.name}
          </h3>
          
          <p className="text-xs text-muted-foreground mb-2">
            {product?.vendor}
          </p>
          
          <div className="flex items-center gap-1 mb-2">
            <Icon name="StarIcon" size={14} className="text-accent fill-accent" />
            <span className="text-xs font-medium text-foreground">
              {product?.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product?.reviews})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">
                TZS {product?.price?.toLocaleString()}
              </p>
              {product?.originalPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  TZS {product?.originalPrice?.toLocaleString()}
                </p>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
              <Icon name="HeartIcon" size={20} className="text-muted-foreground hover:text-error" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

ProductCard.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    imageAlt: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    vendor: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    reviews: PropTypes?.number?.isRequired,
    price: PropTypes?.number?.isRequired,
    originalPrice: PropTypes?.number,
    discount: PropTypes?.number
  })?.isRequired
};
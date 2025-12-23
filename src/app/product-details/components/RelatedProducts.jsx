import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function RelatedProducts({ products, title }) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <h2 className="text-2xl font-heading font-bold text-foreground mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <Link
            key={product?.id}
            href="/product-details"
            className="group bg-background rounded-lg border border-border overflow-hidden hover:shadow-card transition-all duration-200"
          >
            <div className="relative aspect-square overflow-hidden">
              <AppImage
                src={product?.image}
                alt={product?.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product?.discount && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded">
                  -{product?.discount}%
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                {product?.name}
              </h3>
              <div className="flex items-center space-x-1 mb-2">
                <Icon name="StarIcon" size={14} className="text-accent fill-accent" />
                <span className="text-xs font-medium text-foreground">{product?.rating}</span>
                <span className="text-xs text-muted-foreground">({product?.reviews})</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-base font-bold text-primary">
                  TZS {product?.price?.toLocaleString()}
                </span>
                {product?.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    TZS {product?.originalPrice?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

RelatedProducts.propTypes = {
  products: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired,
      image: PropTypes?.string?.isRequired,
      imageAlt: PropTypes?.string?.isRequired,
      price: PropTypes?.number?.isRequired,
      originalPrice: PropTypes?.number,
      discount: PropTypes?.number,
      rating: PropTypes?.number?.isRequired,
      reviews: PropTypes?.number?.isRequired,
    })
  )?.isRequired,
  title: PropTypes?.string?.isRequired,
};
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function ProductInfoSection({ product }) {
  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          {product?.title}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Icon name="StarIcon" size={18} className="text-accent fill-accent" />
            <span className="text-sm font-semibold text-foreground">
              {product?.rating?.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({product?.reviewCount} reviews)
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {product?.soldCount} sold
          </span>
        </div>
      </div>
      {/* Pricing */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-heading font-bold text-primary">
            TZS {product?.price?.toLocaleString()}
          </span>
          {product?.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              TZS {product?.originalPrice?.toLocaleString()}
            </span>
          )}
          {product?.discount && (
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded">
              -{product?.discount}%
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
          <span>≈ USD {product?.priceUSD?.toFixed(2)}</span>
          <span>≈ EUR {product?.priceEUR?.toFixed(2)}</span>
        </div>
      </div>
      {/* Availability Status */}
      <div className="flex items-center space-x-2">
        {product?.inStock ? (
          <>
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
            <span className="text-sm font-medium text-success">In Stock</span>
            <span className="text-sm text-muted-foreground">
              ({product?.stockQuantity} units available)
            </span>
          </>
        ) : (
          <>
            <Icon name="XCircleIcon" size={20} className="text-error" />
            <span className="text-sm font-medium text-error">Out of Stock</span>
          </>
        )}
      </div>
      {/* Product Description */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-foreground mb-3">
          Product Description
        </h2>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {product?.description}
        </p>
      </div>
      {/* Specifications */}
      {product?.specifications && product?.specifications?.length > 0 && (
        <div>
          <h2 className="text-lg font-heading font-semibold text-foreground mb-3">
            Specifications
          </h2>
          <div className="space-y-2">
            {product?.specifications?.map((spec, index) => (
              <div
                key={index}
                className="flex items-start py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground w-1/3">{spec?.label}</span>
                <span className="text-sm text-foreground font-medium flex-1">{spec?.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Digital Product Info */}
      {product?.isDigital && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="CloudArrowDownIcon" size={24} className="text-accent flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Digital Product Information
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>File Format: {product?.digitalInfo?.format}</p>
                <p>File Size: {product?.digitalInfo?.size}</p>
                <p>Instant download after purchase</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProductInfoSection.propTypes = {
  product: PropTypes?.shape({
    title: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    reviewCount: PropTypes?.number?.isRequired,
    soldCount: PropTypes?.number?.isRequired,
    price: PropTypes?.number?.isRequired,
    originalPrice: PropTypes?.number,
    discount: PropTypes?.number,
    priceUSD: PropTypes?.number?.isRequired,
    priceEUR: PropTypes?.number?.isRequired,
    inStock: PropTypes?.bool?.isRequired,
    stockQuantity: PropTypes?.number,
    description: PropTypes?.string?.isRequired,
    specifications: PropTypes?.arrayOf(
      PropTypes?.shape({
        label: PropTypes?.string?.isRequired,
        value: PropTypes?.string?.isRequired,
      })
    ),
    isDigital: PropTypes?.bool,
    digitalInfo: PropTypes?.shape({
      format: PropTypes?.string,
      size: PropTypes?.string,
    }),
  })?.isRequired,
};
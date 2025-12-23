import PropTypes from 'prop-types';
import ProductCard from './ProductCard';

export default function ProductGrid({ 
  products, 
  onAddToCart, 
  onToggleWishlist, 
  wishlistItems 
}) {
  if (products?.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      {products?.map((product) => (
        <ProductCard
          key={product?.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={wishlistItems?.includes(product?.id)}
        />
      ))}
    </>
  );
}

ProductGrid.propTypes = {
  products: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired,
      image: PropTypes?.string?.isRequired,
      imageAlt: PropTypes?.string?.isRequired,
      price: PropTypes?.number?.isRequired,
      originalPrice: PropTypes?.number,
      rating: PropTypes?.number?.isRequired,
      reviewCount: PropTypes?.number?.isRequired,
      stock: PropTypes?.number?.isRequired,
      vendor: PropTypes?.shape({
        name: PropTypes?.string?.isRequired,
        logo: PropTypes?.string?.isRequired,
        logoAlt: PropTypes?.string?.isRequired,
        location: PropTypes?.string?.isRequired,
      })?.isRequired,
    })
  )?.isRequired,
  onAddToCart: PropTypes?.func?.isRequired,
  onToggleWishlist: PropTypes?.func?.isRequired,
  wishlistItems: PropTypes?.arrayOf(PropTypes?.string)?.isRequired,
};
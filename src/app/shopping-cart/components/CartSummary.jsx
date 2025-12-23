import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function CartSummary({ summary }) {
  const { subtotal, shipping, tax, discount, total, itemCount, estimatedDelivery } = summary;

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Order Summary</h2>
      {/* Summary Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-foreground">TZS {subtotal?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">TZS {shipping?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (18% VAT)</span>
          <span className="font-medium text-foreground">TZS {tax?.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">Discount</span>
            <span className="font-medium text-success">-TZS {discount?.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="border-t border-border pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-foreground">Total</span>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">TZS {total?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">≈ USD {(total / 2500)?.toFixed(2)}</p>
          </div>
        </div>
      </div>
      {/* Estimated Delivery */}
      <div className="bg-muted/20 rounded-lg p-3 mb-4 border border-border">
        <div className="flex items-start gap-2">
          <Icon name="ClockIcon" size={18} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Estimated Delivery</p>
            <p className="text-sm text-muted-foreground">{estimatedDelivery}</p>
          </div>
        </div>
      </div>
      {/* Checkout Button */}
      <Link href="/checkout-process">
        <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 shadow-card">
          <span>Proceed to Checkout</span>
          <Icon name="ArrowRightIcon" size={20} />
        </button>
      </Link>
      {/* Security Badges */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon name="ShieldCheckIcon" size={16} className="text-success" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="LockClosedIcon" size={16} className="text-success" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>
      {/* Continue Shopping */}
      <Link href="/product-catalog">
        <button className="w-full mt-3 border border-border text-foreground py-2 rounded-lg font-medium hover:bg-muted transition-colors duration-200 flex items-center justify-center gap-2">
          <Icon name="ArrowLeftIcon" size={18} />
          <span>Continue Shopping</span>
        </button>
      </Link>
    </div>
  );
}

CartSummary.propTypes = {
  summary: PropTypes?.shape({
    subtotal: PropTypes?.number?.isRequired,
    shipping: PropTypes?.number?.isRequired,
    tax: PropTypes?.number?.isRequired,
    discount: PropTypes?.number?.isRequired,
    total: PropTypes?.number?.isRequired,
    itemCount: PropTypes?.number?.isRequired,
    estimatedDelivery: PropTypes?.string?.isRequired,
  })?.isRequired,
};
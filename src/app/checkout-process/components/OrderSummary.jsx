import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function OrderSummary({ cartItems, currency }) {
  const calculateVendorSubtotal = (items) => {
    return items?.reduce((sum, item) => sum + item?.price * item?.quantity, 0);
  };

  const calculateTotalShipping = () => {
    return cartItems?.reduce((sum, vendor) => sum + vendor?.shippingCost, 0);
  };

  const calculateSubtotal = () => {
    return cartItems?.reduce((sum, vendor) => sum + calculateVendorSubtotal(vendor?.items), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalShipping() + calculateTax();
  };

  const formatCurrency = (amount) => {
    if (currency === 'TZS') {
      return `TZS ${amount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${currency} ${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-heading font-bold text-foreground mb-4">Order Summary</h3>
      <div className="space-y-6 mb-6">
        {cartItems?.map((vendor) => (
          <div key={vendor?.vendorId} className="border-b border-border pb-4 last:border-b-0">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="BuildingStorefrontIcon" size={18} className="text-primary" />
              <h4 className="font-semibold text-foreground">{vendor?.vendorName}</h4>
            </div>

            <div className="space-y-3">
              {vendor?.items?.map((item) => (
                <div key={item?.id} className="flex items-start space-x-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <AppImage
                      src={item?.image}
                      alt={item?.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-foreground truncate">{item?.name}</h5>
                    <p className="text-xs text-muted-foreground">Qty: {item?.quantity}</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatCurrency(item?.price * item?.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Vendor Subtotal:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(calculateVendorSubtotal(vendor?.items))}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Shipping:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(vendor?.shippingCost)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium text-foreground">{formatCurrency(calculateSubtotal())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping:</span>
          <span className="font-medium text-foreground">
            {formatCurrency(calculateTotalShipping())}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (18% VAT):</span>
          <span className="font-medium text-foreground">{formatCurrency(calculateTax())}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-border pt-3 mt-3">
          <span className="text-foreground">Total:</span>
          <span className="text-primary">{formatCurrency(calculateTotal())}</span>
        </div>
      </div>
      <div className="mt-6 p-4 bg-success/10 rounded-lg border border-success/20">
        <div className="flex items-start space-x-2">
          <Icon name="ShieldCheckIcon" size={20} className="text-success mt-0.5" />
          <div className="text-xs text-foreground">
            <p className="font-semibold mb-1">Buyer Protection</p>
            <p className="text-muted-foreground">
              Your payment is held in escrow until you confirm delivery. Full refund if items don't
              match description.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

OrderSummary.propTypes = {
  cartItems: PropTypes?.arrayOf(
    PropTypes?.shape({
      vendorId: PropTypes?.number?.isRequired,
      vendorName: PropTypes?.string?.isRequired,
      shippingCost: PropTypes?.number?.isRequired,
      items: PropTypes?.arrayOf(
        PropTypes?.shape({
          id: PropTypes?.number?.isRequired,
          name: PropTypes?.string?.isRequired,
          price: PropTypes?.number?.isRequired,
          quantity: PropTypes?.number?.isRequired,
          image: PropTypes?.string?.isRequired,
          alt: PropTypes?.string?.isRequired
        })
      )?.isRequired
    })
  )?.isRequired,
  currency: PropTypes?.string?.isRequired
};
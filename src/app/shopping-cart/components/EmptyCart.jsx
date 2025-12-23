import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function EmptyCart() {
  return (
    <div className="bg-card border border-border rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="ShoppingCartIcon" size={48} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
        </p>
        <Link href="/product-catalog">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto shadow-card">
            <Icon name="ShoppingBagIcon" size={20} />
            <span>Start Shopping</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function MobileSummaryFooter({ total, itemCount }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-modal z-50 lg:hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{itemCount} items</p>
          <p className="text-xl font-bold text-primary">TZS {total?.toLocaleString()}</p>
        </div>
        <Link href="/checkout-process">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 shadow-card">
            <span>Checkout</span>
            <Icon name="ArrowRightIcon" size={18} />
          </button>
        </Link>
      </div>
    </div>
  );
}

MobileSummaryFooter.propTypes = {
  total: PropTypes?.number?.isRequired,
  itemCount: PropTypes?.number?.isRequired,
};
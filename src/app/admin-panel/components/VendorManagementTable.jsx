import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function VendorManagementTable({ vendors }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'rejected':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Business Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendors?.map((vendor) => (
              <tr key={vendor?.id} className="hover:bg-muted/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <AppImage
                        src={vendor?.logo}
                        alt={vendor?.logoAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{vendor?.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground">{vendor?.businessType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vendor?.status)}`}>
                    {vendor?.status?.charAt(0)?.toUpperCase() + vendor?.status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Icon name="StarIcon" size={16} variant="solid" className="text-accent" />
                    <span className="text-sm font-medium text-foreground">{vendor?.rating}</span>
                    <span className="text-xs text-muted-foreground">({vendor?.reviews})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground">{vendor?.productCount}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors duration-200"
                      aria-label="View vendor details"
                    >
                      <Icon name="EyeIcon" size={18} />
                    </button>
                    <button
                      className="p-2 rounded-md hover:bg-success/10 text-success transition-colors duration-200"
                      aria-label="Approve vendor"
                    >
                      <Icon name="CheckIcon" size={18} />
                    </button>
                    <button
                      className="p-2 rounded-md hover:bg-error/10 text-error transition-colors duration-200"
                      aria-label="Reject vendor"
                    >
                      <Icon name="XMarkIcon" size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

VendorManagementTable.propTypes = {
  vendors: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      email: PropTypes?.string?.isRequired,
      logo: PropTypes?.string?.isRequired,
      logoAlt: PropTypes?.string?.isRequired,
      businessType: PropTypes?.string?.isRequired,
      status: PropTypes?.oneOf(['pending', 'approved', 'rejected'])?.isRequired,
      rating: PropTypes?.number?.isRequired,
      reviews: PropTypes?.number?.isRequired,
      productCount: PropTypes?.number?.isRequired,
    })
  )?.isRequired,
};
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function SavedAddressList({ addresses, selectedAddressId, onSelectAddress }) {
  return (
    <div className="space-y-3">
      {addresses?.map((address) => (
        <div
          key={address?.id}
          onClick={() => onSelectAddress(address?.id)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedAddressId === address?.id
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  selectedAddressId === address?.id
                    ? 'border-primary bg-primary' :'border-muted-foreground'
                }`}
              >
                {selectedAddressId === address?.id && (
                  <Icon name="CheckIcon" size={14} className="text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-foreground">{address?.fullName}</h4>
                  {address?.isDefault && (
                    <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{address?.address}</p>
                <p className="text-sm text-muted-foreground">
                  {address?.city}, {address?.region} {address?.postalCode}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Icon name="PhoneIcon" size={14} className="inline mr-1" />
                  {address?.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

SavedAddressList.propTypes = {
  addresses: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      fullName: PropTypes?.string?.isRequired,
      phone: PropTypes?.string?.isRequired,
      address: PropTypes?.string?.isRequired,
      city: PropTypes?.string?.isRequired,
      region: PropTypes?.string?.isRequired,
      postalCode: PropTypes?.string,
      isDefault: PropTypes?.bool
    })
  )?.isRequired,
  selectedAddressId: PropTypes?.number,
  onSelectAddress: PropTypes?.func?.isRequired
};
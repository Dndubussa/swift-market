import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function DeliveryAddressForm({ formData, onInputChange, errors }) {
  const regions = [
    'Dar es Salaam',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Mbeya',
    'Morogoro',
    'Tanga',
    'Zanzibar'
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData?.fullName}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.fullName ? 'border-error' : 'border-input'
            }`}
            placeholder="John Doe"
          />
          {errors?.fullName && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
              {errors?.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData?.phone}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.phone ? 'border-error' : 'border-input'
            }`}
            placeholder="+255 712 345 678"
          />
          {errors?.phone && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
              {errors?.phone}
            </p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
          Street Address *
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData?.address}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
            errors?.address ? 'border-error' : 'border-input'
          }`}
          placeholder="123 Uhuru Street"
        />
        {errors?.address && (
          <p className="mt-1 text-sm text-error flex items-center">
            <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
            {errors?.address}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-foreground mb-2">
            Region *
          </label>
          <select
            id="region"
            name="region"
            value={formData?.region}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.region ? 'border-error' : 'border-input'
            }`}
          >
            <option value="">Select Region</option>
            {regions?.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors?.region && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
              {errors?.region}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
            City/District *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData?.city}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.city ? 'border-error' : 'border-input'
            }`}
            placeholder="Kinondoni"
          />
          {errors?.city && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
              {errors?.city}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData?.postalCode}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="14111"
          />
        </div>
      </div>
      <div>
        <label htmlFor="deliveryNotes" className="block text-sm font-medium text-foreground mb-2">
          Delivery Notes (Optional)
        </label>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          value={formData?.deliveryNotes}
          onChange={onInputChange}
          rows={3}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Any special delivery instructions..."
        />
      </div>
    </div>
  );
}

DeliveryAddressForm.propTypes = {
  formData: PropTypes?.shape({
    fullName: PropTypes?.string?.isRequired,
    phone: PropTypes?.string?.isRequired,
    address: PropTypes?.string?.isRequired,
    region: PropTypes?.string?.isRequired,
    city: PropTypes?.string?.isRequired,
    postalCode: PropTypes?.string,
    deliveryNotes: PropTypes?.string
  })?.isRequired,
  onInputChange: PropTypes?.func?.isRequired,
  errors: PropTypes?.object?.isRequired
};
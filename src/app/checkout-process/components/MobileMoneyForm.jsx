import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function MobileMoneyForm({ paymentMethod, phoneNumber, onPhoneChange, error }) {
  const getProviderName = () => {
    const providers = {
      mpesa: 'M-Pesa',
      tigo: 'Tigo Pesa',
      airtel: 'Airtel Money',
      halopesa: 'Halopesa'
    };
    return providers?.[paymentMethod] || 'Mobile Money';
  };

  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="DevicePhoneMobileIcon" size={20} className="text-secondary" />
        <h4 className="font-semibold text-foreground">{getProviderName()} Payment</h4>
      </div>

      <div>
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-foreground mb-2">
          Mobile Number *
        </label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          value={phoneNumber}
          onChange={onPhoneChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
            error ? 'border-error' : 'border-input'
          }`}
          placeholder="+255 712 345 678"
        />
        {error && (
          <p className="mt-1 text-sm text-error flex items-center">
            <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          You will receive a payment prompt on your phone to complete the transaction
        </p>
      </div>

      <div className="mt-4 p-3 bg-accent/10 rounded-md border border-accent/20">
        <div className="flex items-start space-x-2">
          <Icon name="InformationCircleIcon" size={18} className="text-accent mt-0.5" />
          <div className="text-xs text-foreground">
            <p className="font-medium mb-1">How to complete payment:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Enter your {getProviderName()} registered number</li>
              <li>Click "Place Order" to proceed</li>
              <li>Check your phone for payment prompt</li>
              <li>Enter your PIN to confirm payment</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

MobileMoneyForm.propTypes = {
  paymentMethod: PropTypes?.string?.isRequired,
  phoneNumber: PropTypes?.string?.isRequired,
  onPhoneChange: PropTypes?.func?.isRequired,
  error: PropTypes?.string
};
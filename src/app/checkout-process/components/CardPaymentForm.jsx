import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function CardPaymentForm({ cardData, onInputChange, errors }) {
  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="CreditCardIcon" size={20} className="text-accent" />
        <h4 className="font-semibold text-foreground">Card Payment via ClickPesa</h4>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-2">
            Card Number *
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardData?.cardNumber}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.cardNumber ? 'border-error' : 'border-input'
            }`}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
          {errors?.cardNumber && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
              {errors?.cardNumber}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-foreground mb-2">
            Cardholder Name *
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={cardData?.cardName}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.cardName ? 'border-error' : 'border-input'
            }`}
            placeholder="JOHN DOE"
          />
          {errors?.cardName && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
              {errors?.cardName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-foreground mb-2">
              Expiry Date *
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={cardData?.expiryDate}
              onChange={onInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.expiryDate ? 'border-error' : 'border-input'
              }`}
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors?.expiryDate && (
              <p className="mt-1 text-sm text-error flex items-center">
                <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
                {errors?.expiryDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-foreground mb-2">
              CVV *
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={cardData?.cvv}
              onChange={onInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.cvv ? 'border-error' : 'border-input'
              }`}
              placeholder="123"
              maxLength={4}
            />
            {errors?.cvv && (
              <p className="mt-1 text-sm text-error flex items-center">
                <Icon name="ExclamationCircleIcon" size={16} className="mr-1" />
                {errors?.cvv}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-2 text-xs text-muted-foreground">
        <Icon name="LockClosedIcon" size={16} className="text-success" />
        <span>Your payment information is encrypted and secure</span>
      </div>
    </div>
  );
}

CardPaymentForm.propTypes = {
  cardData: PropTypes?.shape({
    cardNumber: PropTypes?.string?.isRequired,
    cardName: PropTypes?.string?.isRequired,
    expiryDate: PropTypes?.string?.isRequired,
    cvv: PropTypes?.string?.isRequired
  })?.isRequired,
  onInputChange: PropTypes?.func?.isRequired,
  errors: PropTypes?.object?.isRequired
};
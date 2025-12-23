import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';


export default function PaymentMethodSelector({ selectedMethod, onSelectMethod }) {
  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      type: 'mobile_money',
      icon: 'DevicePhoneMobileIcon',
      description: 'Pay with M-Pesa mobile money',
      popular: true
    },
    {
      id: 'tigo',
      name: 'Tigo Pesa',
      type: 'mobile_money',
      icon: 'DevicePhoneMobileIcon',
      description: 'Pay with Tigo Pesa mobile money',
      popular: true
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      type: 'mobile_money',
      icon: 'DevicePhoneMobileIcon',
      description: 'Pay with Airtel Money',
      popular: false
    },
    {
      id: 'halopesa',
      name: 'Halopesa',
      type: 'mobile_money',
      icon: 'DevicePhoneMobileIcon',
      description: 'Pay with Halopesa mobile money',
      popular: false
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: 'CreditCardIcon',
      description: 'Visa, Mastercard via ClickPesa',
      popular: false
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cash',
      icon: 'BanknotesIcon',
      description: 'Pay when you receive your order',
      popular: false
    }
  ];

  return (
    <div className="space-y-3">
      {paymentMethods?.map((method) => (
        <div
          key={method?.id}
          onClick={() => onSelectMethod(method?.id)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedMethod === method?.id
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method?.id
                    ? 'border-primary bg-primary' :'border-muted-foreground'
                }`}
              >
                {selectedMethod === method?.id && (
                  <Icon name="CheckIcon" size={14} className="text-primary-foreground" />
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  method?.type === 'mobile_money' ?'bg-secondary/10'
                    : method?.type === 'card' ?'bg-accent/10' :'bg-muted'
                }`}
              >
                <Icon
                  name={method?.icon}
                  size={24}
                  className={
                    method?.type === 'mobile_money' ?'text-secondary'
                      : method?.type === 'card' ?'text-accent' :'text-muted-foreground'
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-foreground">{method?.name}</h4>
                  {method?.popular && (
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{method?.description}</p>
              </div>
            </div>
            <Icon
              name="ChevronRightIcon"
              size={20}
              className={`${
                selectedMethod === method?.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

PaymentMethodSelector.propTypes = {
  selectedMethod: PropTypes?.string,
  onSelectMethod: PropTypes?.func?.isRequired
};
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function CheckoutProgress({ currentStep = 1 }) {
  const steps = [
    { id: 1, name: 'Delivery', icon: 'TruckIcon' },
    { id: 2, name: 'Payment', icon: 'CreditCardIcon' },
    { id: 3, name: 'Review', icon: 'ClipboardDocumentCheckIcon' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => (
          <div key={step?.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step?.id
                    ? 'bg-primary text-primary-foreground shadow-card'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step?.id ? (
                  <Icon name="CheckIcon" size={24} />
                ) : (
                  <Icon name={step?.icon} size={24} />
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep >= step?.id ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step?.name}
              </span>
            </div>
            {index < steps?.length - 1 && (
              <div className="flex-1 h-1 mx-4 relative">
                <div className="absolute inset-0 bg-muted rounded-full" />
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    currentStep > step?.id ? 'bg-primary w-full' : 'bg-transparent w-0'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

CheckoutProgress.propTypes = {
  currentStep: PropTypes?.number?.isRequired
};
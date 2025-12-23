'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import CheckoutProgress from './CheckoutProgress';
import SavedAddressList from './SavedAddressList';
import DeliveryAddressForm from './DeliveryAddressForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import MobileMoneyForm from './MobileMoneyForm';
import CardPaymentForm from './CardPaymentForm';
import OrderSummary from './OrderSummary';
import SecurityBadges from './SecurityBadges';

export default function CheckoutInteractive({ initialCartData, initialUser }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [currency, setCurrency] = useState('TZS');
  const [isProcessing, setIsProcessing] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    region: '',
    city: '',
    postalCode: '',
    deliveryNotes: ''
  });

  const [deliveryErrors, setDeliveryErrors] = useState({});

  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('');
  const [mobileMoneyError, setMobileMoneyError] = useState('');

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [cardErrors, setCardErrors] = useState({});

  const savedAddresses = [
    {
      id: 1,
      fullName: 'John Doe',
      phone: '+255 712 345 678',
      address: '123 Uhuru Street, Kinondoni',
      city: 'Dar es Salaam',
      region: 'Dar es Salaam',
      postalCode: '14111',
      isDefault: true
    },
    {
      id: 2,
      fullName: 'John Doe',
      phone: '+255 712 345 678',
      address: '456 Makumbusho Road, Ilala',
      city: 'Dar es Salaam',
      region: 'Dar es Salaam',
      postalCode: '11101',
      isDefault: false
    }
  ];

  const handleDeliveryInputChange = (e) => {
    const { name, value } = e?.target;
    setDeliveryForm((prev) => ({
      ...prev,
      [name]: value
    }));
    if (deliveryErrors?.[name]) {
      setDeliveryErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e?.target;
    setCardData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (cardErrors?.[name]) {
      setCardErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMobileMoneyPhoneChange = (e) => {
    setMobileMoneyPhone(e?.target?.value);
    if (mobileMoneyError) {
      setMobileMoneyError('');
    }
  };

  const validateDeliveryForm = () => {
    const errors = {};
    if (!deliveryForm?.fullName?.trim()) errors.fullName = 'Full name is required';
    if (!deliveryForm?.phone?.trim()) errors.phone = 'Phone number is required';
    if (!deliveryForm?.address?.trim()) errors.address = 'Address is required';
    if (!deliveryForm?.region) errors.region = 'Region is required';
    if (!deliveryForm?.city?.trim()) errors.city = 'City is required';
    return errors;
  };

  const validateCardForm = () => {
    const errors = {};
    if (!cardData?.cardNumber?.trim()) errors.cardNumber = 'Card number is required';
    if (!cardData?.cardName?.trim()) errors.cardName = 'Cardholder name is required';
    if (!cardData?.expiryDate?.trim()) errors.expiryDate = 'Expiry date is required';
    if (!cardData?.cvv?.trim()) errors.cvv = 'CVV is required';
    return errors;
  };

  const handleContinueToPayment = () => {
    if (!selectedAddressId && !showNewAddressForm) {
      alert('Please select a delivery address or add a new one');
      return;
    }

    if (showNewAddressForm) {
      const errors = validateDeliveryForm();
      if (Object.keys(errors)?.length > 0) {
        setDeliveryErrors(errors);
        return;
      }
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToReview = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (
      ['mpesa', 'tigo', 'airtel', 'halopesa']?.includes(selectedPaymentMethod) &&
      !mobileMoneyPhone?.trim()
    ) {
      setMobileMoneyError('Mobile number is required');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      const errors = validateCardForm();
      if (Object.keys(errors)?.length > 0) {
        setCardErrors(errors);
        return;
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      router?.push('/order-tracking');
    }, 2000);
  };

  const getSelectedAddress = () => {
    if (showNewAddressForm) {
      return deliveryForm;
    }
    return savedAddresses?.find((addr) => addr?.id === selectedAddressId);
  };

  const getPaymentMethodName = () => {
    const methods = {
      mpesa: 'M-Pesa',
      tigo: 'Tigo Pesa',
      airtel: 'Airtel Money',
      halopesa: 'Halopesa',
      card: 'Credit/Debit Card',
      cod: 'Cash on Delivery'
    };
    return methods?.[selectedPaymentMethod] || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order securely</p>
        </div>

        <CheckoutProgress currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Icon name="TruckIcon" size={24} className="text-primary" />
                    <h2 className="text-xl font-heading font-bold text-foreground">
                      Delivery Information
                    </h2>
                  </div>
                </div>

                {initialUser && !showNewAddressForm && (
                  <>
                    <SavedAddressList
                      addresses={savedAddresses}
                      selectedAddressId={selectedAddressId}
                      onSelectAddress={setSelectedAddressId}
                    />

                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-border rounded-lg text-primary hover:bg-primary/5 transition-colors duration-200"
                    >
                      <Icon name="PlusIcon" size={20} />
                      <span className="font-medium">Add New Address</span>
                    </button>
                  </>
                )}

                {(showNewAddressForm || !initialUser) && (
                  <>
                    {showNewAddressForm && (
                      <button
                        onClick={() => setShowNewAddressForm(false)}
                        className="mb-4 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
                      >
                        <Icon name="ArrowLeftIcon" size={18} />
                        <span className="text-sm font-medium">Back to saved addresses</span>
                      </button>
                    )}
                    <DeliveryAddressForm
                      formData={deliveryForm}
                      onInputChange={handleDeliveryInputChange}
                      errors={deliveryErrors}
                    />
                  </>
                )}

                <button
                  onClick={handleContinueToPayment}
                  className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continue to Payment</span>
                  <Icon name="ArrowRightIcon" size={20} />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Icon name="CreditCardIcon" size={24} className="text-primary" />
                    <h2 className="text-xl font-heading font-bold text-foreground">
                      Payment Method
                    </h2>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                  >
                    Edit Delivery
                  </button>
                </div>

                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onSelectMethod={setSelectedPaymentMethod}
                />

                {['mpesa', 'tigo', 'airtel', 'halopesa']?.includes(selectedPaymentMethod) && (
                  <MobileMoneyForm
                    paymentMethod={selectedPaymentMethod}
                    phoneNumber={mobileMoneyPhone}
                    onPhoneChange={handleMobileMoneyPhoneChange}
                    error={mobileMoneyError}
                  />
                )}

                {selectedPaymentMethod === 'card' && (
                  <CardPaymentForm
                    cardData={cardData}
                    onInputChange={handleCardInputChange}
                    errors={cardErrors}
                  />
                )}

                {selectedPaymentMethod === 'cod' && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-start space-x-2">
                      <Icon name="InformationCircleIcon" size={20} className="text-accent mt-0.5" />
                      <div className="text-sm text-foreground">
                        <p className="font-semibold mb-1">Cash on Delivery</p>
                        <p className="text-muted-foreground">
                          Pay with cash when your order is delivered. Please have exact amount ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleContinueToReview}
                  className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continue to Review</span>
                  <Icon name="ArrowRightIcon" size={20} />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Icon name="ClipboardDocumentCheckIcon" size={24} className="text-primary" />
                  <h2 className="text-xl font-heading font-bold text-foreground">Review Order</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Delivery Address</h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                      >
                        Edit
                      </button>
                    </div>
                    {getSelectedAddress() && (
                      <div className="text-sm text-foreground">
                        <p className="font-medium">{getSelectedAddress()?.fullName}</p>
                        <p className="text-muted-foreground">{getSelectedAddress()?.address}</p>
                        <p className="text-muted-foreground">
                          {getSelectedAddress()?.city}, {getSelectedAddress()?.region}{' '}
                          {getSelectedAddress()?.postalCode}
                        </p>
                        <p className="text-muted-foreground mt-1">{getSelectedAddress()?.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Payment Method</h3>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-sm text-foreground">
                      <p className="font-medium">{getPaymentMethodName()}</p>
                      {['mpesa', 'tigo', 'airtel', 'halopesa']?.includes(selectedPaymentMethod) && (
                        <p className="text-muted-foreground">{mobileMoneyPhone}</p>
                      )}
                      {selectedPaymentMethod === 'card' && (
                        <p className="text-muted-foreground">
                          Card ending in {cardData?.cardNumber?.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-start space-x-2">
                      <Icon name="InformationCircleIcon" size={20} className="text-accent mt-0.5" />
                      <div className="text-sm text-foreground">
                        <p className="font-semibold mb-1">Before you place your order:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Review your items and delivery address</li>
                          <li>Your payment will be held in escrow until delivery confirmation</li>
                          <li>You can track your order in real-time after placement</li>
                          <li>Contact vendor directly for any product questions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold text-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="ArrowPathIcon" size={24} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="CheckCircleIcon" size={24} />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <OrderSummary cartItems={initialCartData} currency={currency} />
            <SecurityBadges />

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-semibold text-foreground mb-3">Currency</h4>
              <select
                value={currency}
                onChange={(e) => setCurrency(e?.target?.value)}
                className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TZS">TZS - Tanzanian Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
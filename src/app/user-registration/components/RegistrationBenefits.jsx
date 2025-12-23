import Icon from '@/components/ui/AppIcon';

export default function RegistrationBenefits() {
  const benefits = [
    {
      icon: 'ShoppingBagIcon',
      title: 'Wide Product Selection',
      description: 'Access thousands of products from verified vendors across Tanzania'
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Secure Payments',
      description: 'Multiple payment options including M-Pesa, Tigo Pesa, and card payments'
    },
    {
      icon: 'TruckIcon',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep across major cities'
    },
    {
      icon: 'ChatBubbleLeftRightIcon',
      title: '24/7 Support',
      description: 'Get help anytime with our dedicated customer support team'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 rounded-2xl p-8 text-white shadow-xl">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">
          Join Blinno Marketplace Today
        </h3>
        <p className="text-white/80">
          Create your account and start shopping or selling in minutes
        </p>
      </div>
      <div className="space-y-4">
        {benefits?.map((benefit, index) => (
          <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={benefit?.icon} size={24} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">{benefit?.title}</h4>
              <p className="text-sm text-white/80">{benefit?.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-yellow-400/90 text-gray-900 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Icon name="SparklesIcon" size={24} className="text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">Special Offer</h4>
            <p className="text-sm text-gray-800">
              Get 10% off your first purchase when you register today!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
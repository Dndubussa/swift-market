import UserRegistrationInteractive from './components/UserRegistrationInteractive';

export const metadata = {
  title: 'User Registration - Blinno Marketplace',
  description: 'Create your account on Blinno Marketplace. Join thousands of buyers and sellers on Tanzania\'s leading e-commerce platform with secure payments and fast delivery.',
};

export default function UserRegistrationPage() {
  const initialData = {
    specialOffer: 'Get 10% off your first purchase',
    benefits: [
      {
        icon: 'ShoppingBagIcon',
        title: 'Wide Product Selection',
        description: 'Access thousands of products from verified vendors'
      },
      {
        icon: 'ShieldCheckIcon',
        title: 'Secure Payments',
        description: 'Multiple payment options including mobile money'
      },
      {
        icon: 'TruckIcon',
        title: 'Fast Delivery',
        description: 'Quick delivery across major cities'
      },
      {
        icon: 'ChatBubbleLeftRightIcon',
        title: '24/7 Support',
        description: 'Dedicated customer support team'
      }
    ]
  };

  return <UserRegistrationInteractive initialData={initialData} />;
}
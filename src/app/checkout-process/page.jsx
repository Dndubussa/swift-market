import CheckoutInteractive from './components/CheckoutInteractive';

export const metadata = {
  title: 'Checkout - Blinno Marketplace',
  description: 'Complete your order securely with multiple payment options including mobile money and card payments'
};

export default function CheckoutPage() {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'buyer'
  };

  const mockCartData = [
  {
    vendorId: 1,
    vendorName: 'TechHub Electronics',
    shippingCost: 5000,
    items: [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 85000,
      quantity: 1,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1119295e3-1765076790006.png",
      alt: 'Black wireless over-ear headphones with cushioned ear cups on white background'
    },
    {
      id: 2,
      name: 'USB-C Fast Charging Cable',
      price: 15000,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1707404711643-2aed6bc8737d",
      alt: 'White USB-C charging cable coiled on wooden surface'
    }]

  },
  {
    vendorId: 2,
    vendorName: 'Fashion Forward',
    shippingCost: 3000,
    items: [
    {
      id: 3,
      name: 'Cotton T-Shirt - Navy Blue',
      price: 25000,
      quantity: 3,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_19db2d88e-1765569809479.png",
      alt: 'Navy blue cotton crew neck t-shirt laid flat on white background'
    }]

  }];


  return <CheckoutInteractive initialCartData={mockCartData} initialUser={mockUser} />;
}
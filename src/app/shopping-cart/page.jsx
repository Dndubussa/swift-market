import ShoppingCartInteractive from './components/ShoppingCartInteractive';

export const metadata = {
  title: 'Shopping Cart - Blinno Marketplace',
  description: 'Review your cart items, apply coupons, and proceed to checkout on Blinno Marketplace'
};

export default function ShoppingCartPage() {
  const mockCartData = {
    vendors: [
    {
      id: 'vendor-1',
      name: 'TechHub Tanzania',
      rating: 4.8,
      reviews: 1250,
      location: 'Dar es Salaam',
      shippingRegion: 'Dar es Salaam',
      deliveryTime: '2-3 business days',
      shippingCost: 5000,
      items: [
      {
        id: 'item-1',
        name: 'Samsung Galaxy A54 5G Smartphone - 128GB Storage',
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2573c60-1765864137060.png",
        alt: 'Black Samsung Galaxy smartphone with curved edges on white surface',
        price: 850000,
        quantity: 1,
        stock: 15,
        variant: 'Black, 128GB'
      },
      {
        id: 'item-2',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_13e126511-1765030295691.png",
        alt: 'Silver wireless over-ear headphones with black cushions on wooden table',
        price: 650000,
        quantity: 1,
        stock: 8
      }]

    },
    {
      id: 'vendor-2',
      name: 'Mama Neema Fashion',
      rating: 4.6,
      reviews: 890,
      location: 'Arusha',
      shippingRegion: 'Dar es Salaam',
      deliveryTime: '5-7 business days',
      shippingCost: 8000,
      items: [
      {
        id: 'item-3',
        name: 'Traditional Kitenge Dress - Handmade African Print',
        image: "https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d",
        alt: 'Colorful African print dress with geometric patterns in red, yellow and blue',
        price: 45000,
        quantity: 2,
        stock: 12,
        variant: 'Size M, Blue Pattern'
      },
      {
        id: 'item-4',
        name: 'Leather Sandals - Handcrafted Maasai Design',
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_1098fcfe0-1764727341824.png",
        alt: 'Brown leather sandals with traditional beaded straps on wooden surface',
        price: 35000,
        quantity: 1,
        stock: 20,
        variant: 'Size 42'
      }]

    },
    {
      id: 'vendor-3',
      name: 'HomeStyle Furniture',
      rating: 4.7,
      reviews: 560,
      location: 'Mwanza',
      shippingRegion: 'Dar es Salaam',
      deliveryTime: '7-10 business days',
      shippingCost: 15000,
      items: [
      {
        id: 'item-5',
        name: 'Modern Coffee Table - Solid Wood with Glass Top',
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_14eb753f8-1764845698055.png",
        alt: 'Rectangular wooden coffee table with glass top in modern living room',
        price: 180000,
        quantity: 1,
        stock: 5,
        variant: 'Walnut Finish'
      }]

    }]

  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShoppingCartInteractive initialCartData={mockCartData} />
      </div>
    </main>
  );
}
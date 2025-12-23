import ProductDetailsInteractive from './components/ProductDetailsInteractive';

export const metadata = {
  title: 'Product Details - Blinno Marketplace',
  description: 'View detailed product information, specifications, reviews, and vendor details on Blinno Marketplace'
};

export default function ProductDetailsPage() {
  const mockProductData = {
    id: 'prod-001',
    title: 'Premium Wireless Bluetooth Headphones with Active Noise Cancellation',
    category: 'Electronics',
    rating: 4.7,
    reviewCount: 201,
    soldCount: 1247,
    price: 185000,
    originalPrice: 250000,
    discount: 26,
    priceUSD: 78.50,
    priceEUR: 73.20,
    inStock: true,
    stockQuantity: 47,
    description: `Experience superior sound quality with our Premium Wireless Bluetooth Headphones. Featuring advanced active noise cancellation technology, these headphones deliver crystal-clear audio while blocking out ambient noise.\n\nPerfect for music lovers, professionals, and travelers, these headphones offer up to 30 hours of battery life on a single charge. The comfortable over-ear design with memory foam cushions ensures all-day comfort.\n\nKey Features:\n• Active Noise Cancellation (ANC) technology\n• Premium 40mm drivers for rich, detailed sound\n• 30-hour battery life with quick charge support\n• Bluetooth 5.0 for stable wireless connectivity\n• Built-in microphone for hands-free calls\n• Foldable design with carrying case included\n• Compatible with all Bluetooth devices`,
    specifications: [
    { label: 'Brand', value: 'AudioTech Pro' },
    { label: 'Model', value: 'AT-NC500' },
    { label: 'Connectivity', value: 'Bluetooth 5.0, 3.5mm Jack' },
    { label: 'Battery Life', value: '30 hours (ANC on), 40 hours (ANC off)' },
    { label: 'Charging Time', value: '2 hours (Full), 10 min (5 hours playback)' },
    { label: 'Driver Size', value: '40mm Dynamic Drivers' },
    { label: 'Frequency Response', value: '20Hz - 20kHz' },
    { label: 'Weight', value: '250g' },
    { label: 'Color Options', value: 'Black, Silver, Rose Gold' },
    { label: 'Warranty', value: '2 Years Manufacturer Warranty' }],

    isDigital: false,
    images: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_13e126511-1765030295691.png",
      alt: 'Black wireless headphones with silver accents on white background showing front view'
    },
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_19dc3e3aa-1765376781717.png",
      alt: 'Side profile view of premium headphones displaying cushioned ear cups'
    },
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_1b3a7c763-1764882857273.png",
      alt: 'Close-up of headphone controls and adjustment mechanism'
    },
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb839c12-1765204286964.png",
      alt: 'Folded headphones in black carrying case with accessories'
    },
    {
      url: "https://images.unsplash.com/photo-1676049666220-94432380abb8",
      alt: 'Person wearing black headphones outdoors with urban background'
    }],

    variants: [
    {
      type: 'Color',
      options: ['Black', 'Silver', 'Rose Gold']
    }]

  };

  const mockVendorData = {
    storeName: 'TechHub Tanzania',
    location: 'Dar es Salaam, Tanzania',
    rating: 4.8,
    totalReviews: 1543,
    responseTime: 'Within 2 hours',
    totalProducts: 287,
    joinDate: 'January 2023'
  };

  const mockReviewsData = {
    averageRating: 4.7,
    totalReviews: 201,
    reviews: [
    {
      id: 'rev-001',
      userName: 'Amina Hassan',
      userImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1e0530897-1765819738200.png",
      userImageAlt: 'Professional woman with dark hair in business attire smiling at camera',
      rating: 5,
      comment: 'Absolutely love these headphones! The noise cancellation is incredible and the sound quality is top-notch. Battery life is exactly as advertised. Worth every shilling!',
      date: '2 days ago',
      verified: true,
      helpfulCount: 24,
      images: [
      {
        url: "https://images.unsplash.com/photo-1713289590436-0f8233031b2d",
        alt: 'User photo showing headphones in use'
      }]

    },
    {
      id: 'rev-002',
      userName: 'John Mwangi',
      userImage: "https://img.rocket.new/generatedImages/rocket_gen_img_144f5236b-1763295524542.png",
      userImageAlt: 'Young man with short black hair wearing casual blue shirt outdoors',
      rating: 4,
      comment: 'Great headphones for the price. The ANC works well in noisy environments. Only minor issue is they can feel a bit tight after long use, but overall very satisfied with my purchase.',
      date: '5 days ago',
      verified: true,
      helpfulCount: 18,
      images: []
    },
    {
      id: 'rev-003',
      userName: 'Sarah Kimani',
      userImage: "https://img.rocket.new/generatedImages/rocket_gen_img_120d48945-1764786516537.png",
      userImageAlt: 'Woman with long brown hair in white top smiling in bright setting',
      rating: 5,
      comment: 'Perfect for my daily commute! The battery lasts for days and the quick charge feature is a lifesaver. Sound quality is amazing for both music and calls. Highly recommend!',
      date: '1 week ago',
      verified: true,
      helpfulCount: 31,
      images: []
    },
    {
      id: 'rev-004',
      userName: 'David Omondi',
      userImage: "https://img.rocket.new/generatedImages/rocket_gen_img_104d263f2-1765181753393.png",
      userImageAlt: 'Man with glasses and beard in professional attire against gray background',
      rating: 4,
      comment: 'Solid build quality and excellent sound. The noise cancellation is good but not perfect. Still, for the price point, these are excellent headphones. Delivery was fast too!',
      date: '2 weeks ago',
      verified: true,
      helpfulCount: 12,
      images: []
    }]

  };

  const mockRelatedProductsData = {
    sameVendor: [
    {
      id: 'prod-002',
      name: 'Wireless Earbuds Pro with Charging Case',
      image: "https://images.unsplash.com/photo-1722040456443-c644d014d43f",
      imageAlt: 'White wireless earbuds in open charging case on marble surface',
      price: 95000,
      originalPrice: 120000,
      discount: 21,
      rating: 4.6,
      reviews: 156
    },
    {
      id: 'prod-003',
      name: 'Portable Bluetooth Speaker Waterproof',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1aae88582-1764660840888.png",
      imageAlt: 'Black cylindrical bluetooth speaker with metallic finish on wooden table',
      price: 75000,
      rating: 4.5,
      reviews: 203
    },
    {
      id: 'prod-004',
      name: 'USB-C Fast Charging Cable 2m',
      image: "https://images.unsplash.com/photo-1595756630452-736bc8ef3693",
      imageAlt: 'Coiled white USB-C charging cable on light background',
      price: 15000,
      rating: 4.8,
      reviews: 421
    },
    {
      id: 'prod-005',
      name: 'Wireless Charging Pad 15W',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_140c8ffe4-1765299470818.png",
      imageAlt: 'Black circular wireless charging pad with LED indicator',
      price: 45000,
      originalPrice: 60000,
      discount: 25,
      rating: 4.4,
      reviews: 89
    }],

    similar: [
    {
      id: 'prod-006',
      name: 'Studio Quality Over-Ear Headphones',
      image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7",
      imageAlt: 'Professional black studio headphones with padded ear cups',
      price: 165000,
      originalPrice: 210000,
      discount: 21,
      rating: 4.6,
      reviews: 178
    },
    {
      id: 'prod-007',
      name: 'Gaming Headset with RGB Lighting',
      image: "https://images.unsplash.com/photo-1586837033998-87881d891d49",
      imageAlt: 'Black gaming headset with colorful RGB lighting effects',
      price: 125000,
      rating: 4.5,
      reviews: 267
    },
    {
      id: 'prod-008',
      name: 'Sport Wireless Earphones Sweatproof',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_126307fe2-1764654645190.png",
      imageAlt: 'Red sport earphones with ear hooks on fitness equipment',
      price: 55000,
      rating: 4.3,
      reviews: 312
    },
    {
      id: 'prod-009',
      name: 'Premium Noise Cancelling Headphones',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_12a4d5808-1764677183408.png",
      imageAlt: 'Silver premium headphones with leather ear cushions',
      price: 220000,
      originalPrice: 280000,
      discount: 21,
      rating: 4.9,
      reviews: 145
    }]

  };

  return (
    <ProductDetailsInteractive
      productData={mockProductData}
      vendorData={mockVendorData}
      reviewsData={mockReviewsData}
      relatedProductsData={mockRelatedProductsData} />);


}
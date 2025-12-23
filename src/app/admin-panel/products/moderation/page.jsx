import ModerationQueueInteractive from './components/ModerationQueueInteractive';

export const metadata = {
  title: 'Product Moderation Queue - Admin Panel',
  description: 'Review and moderate pending product submissions'
};

export default function ModerationQueuePage() {
  const mockData = {
    summary: {
      pending: 1088,
      today: 156,
      this_week: 423,
      avg_review_time: '4.2 hours'
    },
    products: [
      {
        id: '5',
        name: 'Traditional Kanga Fabric Set (2 pieces)',
        sku: 'FASH-TK-SET-002',
        vendor_name: 'Arusha Fashion Boutique',
        vendor_id: '5',
        category: 'Fashion & Clothing',
        price: 35000,
        stock: 156,
        submitted_at: '2025-12-22T08:30:00Z',
        description: 'Authentic traditional Kanga fabric set featuring vibrant African patterns and meaningful Swahili proverbs. Perfect for cultural events and daily wear.',
        images: ['/products/kanga-1.jpg', '/products/kanga-2.jpg'],
        flags: [],
        priority: 'normal'
      },
      {
        id: '7',
        name: 'Premium Arabica Coffee Beans 1kg',
        sku: 'FOOD-AC-1KG',
        vendor_name: 'Kilimanjaro Coffee Estate',
        vendor_id: '7',
        category: 'Food & Beverages',
        price: 65000,
        stock: 89,
        submitted_at: '2025-12-22T09:15:00Z',
        description: 'Single-origin premium Arabica coffee beans grown on the slopes of Mount Kilimanjaro. Medium roast with notes of chocolate and citrus.',
        images: ['/products/coffee-beans.jpg'],
        flags: ['price_check'],
        priority: 'normal'
      },
      {
        id: '8',
        name: 'Fake Designer Handbag',
        sku: 'FASH-FDB-001',
        vendor_name: 'Suspicious Vendor LLC',
        vendor_id: '8',
        category: 'Fashion & Clothing',
        price: 125000,
        stock: 50,
        submitted_at: '2025-12-21T16:20:00Z',
        description: 'Luxury designer handbag replica with premium materials.',
        images: ['/products/fake-bag.jpg'],
        flags: ['counterfeit_suspected', 'trademark_violation'],
        priority: 'high'
      },
      {
        id: '9',
        name: 'Handmade Maasai Beaded Jewelry Set',
        sku: 'ART-MB-JS-003',
        vendor_name: 'Maasai Crafts Collective',
        vendor_id: '9',
        category: 'Arts & Crafts',
        price: 85000,
        stock: 34,
        submitted_at: '2025-12-22T10:00:00Z',
        description: 'Authentic Maasai beaded jewelry set handcrafted by local artisans. Includes necklace, bracelet, and earrings with traditional patterns.',
        images: ['/products/maasai-jewelry-1.jpg', '/products/maasai-jewelry-2.jpg', '/products/maasai-jewelry-3.jpg'],
        flags: [],
        priority: 'normal'
      },
      {
        id: '10',
        name: 'Organic Moringa Powder 500g',
        sku: 'HLTH-MP-500',
        vendor_name: 'Dodoma Health Foods',
        vendor_id: '10',
        category: 'Health & Wellness',
        price: 42000,
        stock: 120,
        submitted_at: '2025-12-22T07:45:00Z',
        description: '100% organic moringa powder sourced from certified farms. Rich in vitamins, minerals, and antioxidants.',
        images: ['/products/moringa-powder.jpg'],
        flags: ['health_claims'],
        priority: 'normal'
      }
    ]
  };

  return <ModerationQueueInteractive initialData={mockData} />;
}

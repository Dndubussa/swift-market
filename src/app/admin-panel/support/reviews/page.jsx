import ReviewModerationInteractive from './components/ReviewModerationInteractive';

export const metadata = {
  title: 'Review Moderation - Admin Panel',
  description: 'Moderate and manage product reviews'
};

export default function ReviewModerationPage() {
  const mockData = {
    summary: {
      total_reviews: 8934,
      pending: 89,
      approved: 8456,
      rejected: 234,
      flagged: 155
    },
    reviews: [
      {
        id: '1',
        product_name: 'Samsung Galaxy S24 Ultra 256GB',
        product_id: '1',
        reviewer_name: 'Jane Doe',
        reviewer_email: 'jane.doe@example.com',
        rating: 5,
        status: 'pending',
        title: 'Excellent phone with amazing camera!',
        comment: 'Best phone I ever owned. Camera quality is outstanding and battery lasts all day.',
        created_at: '2025-12-23T10:30:00Z',
        flags: []
      },
      {
        id: '2',
        product_name: 'Handcrafted Makonde Wood Sculpture',
        product_id: '3',
        reviewer_name: 'Mark Smith',
        reviewer_email: 'mark.smith@example.com',
        rating: 2,
        status: 'flagged',
        title: 'Poor quality, not as advertised',
        comment: 'The craftsmanship is terrible. Looks nothing like the photos. Complete waste of money. DO NOT BUY!!!',
        created_at: '2025-12-22T14:20:00Z',
        flags: ['possible_spam', 'excessive_caps']
      },
      {
        id: '3',
        product_name: 'Organic Shea Butter Moisturizer 250ml',
        product_id: '4',
        reviewer_name: 'Sarah Johnson',
        reviewer_email: 'sarah.j@example.com',
        rating: 4,
        status: 'approved',
        title: 'Good product, natural ingredients',
        comment: 'Works well on dry skin. Pleasant smell and absorbs quickly. Only 4 stars because packaging could be better.',
        created_at: '2025-12-21T09:15:00Z',
        flags: []
      },
      {
        id: '4',
        product_name: 'Traditional Kanga Fabric Set',
        product_id: '5',
        reviewer_name: 'Emma Wilson',
        reviewer_email: 'emma.w@example.com',
        rating: 1,
        status: 'flagged',
        title: 'Fake product!!! SCAM!!!',
        comment: 'This is FAKE!!! Not authentic at all. Seller is a SCAMMER. Visit my website for better deals: scam-site.com',
        created_at: '2025-12-22T16:45:00Z',
        flags: ['contains_url', 'excessive_caps', 'possible_spam']
      },
      {
        id: '5',
        product_name: 'Zanzibar Spice Mix Collection',
        product_id: '2',
        reviewer_name: 'David Brown',
        reviewer_email: 'david.brown@example.com',
        rating: 5,
        status: 'pending',
        title: 'Authentic spices, great quality',
        comment: 'Fresh and aromatic. Perfect for traditional dishes. Will order again.',
        created_at: '2025-12-23T08:00:00Z',
        flags: []
      }
    ]
  };

  return <ReviewModerationInteractive initialData={mockData} />;
}

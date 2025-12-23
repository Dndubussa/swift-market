import SellerGradingInteractive from './components/SellerGradingInteractive';

export const metadata = {
  title: 'Seller Grading - Admin Panel',
  description: 'Evaluate and grade vendor performance'
};

export default function SellerGradingPage() {
  const mockData = {
    summary: {
      total_vendors: 847,
      excellent: 156,
      good: 389,
      average: 234,
      needs_improvement: 68
    },
    vendors: [
      {
        id: '1',
        business_name: 'Dar Electronics Hub',
        tier: 'gold',
        current_grade: 'A',
        grade_score: 92,
        metrics: {
          response_rate: 98,
          on_time_delivery: 96,
          customer_satisfaction: 4.8,
          return_rate: 2.5,
          order_accuracy: 97,
          communication: 4.9
        },
        total_sales: 25600000,
        orders_count: 1245,
        review_count: 567,
        last_evaluated: '2025-12-15T10:00:00Z',
        trend: 'up'
      },
      {
        id: '2',
        business_name: 'Zanzibar Spice Market',
        tier: 'silver',
        current_grade: 'B+',
        grade_score: 87,
        metrics: {
          response_rate: 95,
          on_time_delivery: 92,
          customer_satisfaction: 4.6,
          return_rate: 3.2,
          order_accuracy: 94,
          communication: 4.7
        },
        total_sales: 18900000,
        orders_count: 892,
        review_count: 423,
        last_evaluated: '2025-12-14T14:20:00Z',
        trend: 'stable'
      },
      {
        id: '3',
        business_name: 'Mwanza Home Decor',
        tier: 'gold',
        current_grade: 'A+',
        grade_score: 95,
        metrics: {
          response_rate: 99,
          on_time_delivery: 98,
          customer_satisfaction: 4.9,
          return_rate: 1.8,
          order_accuracy: 98,
          communication: 5.0
        },
        total_sales: 32100000,
        orders_count: 1678,
        review_count: 892,
        last_evaluated: '2025-12-16T09:30:00Z',
        trend: 'up'
      },
      {
        id: '4',
        business_name: 'Dodoma Digital Arts',
        tier: 'bronze',
        current_grade: 'C',
        grade_score: 68,
        metrics: {
          response_rate: 78,
          on_time_delivery: 82,
          customer_satisfaction: 3.2,
          return_rate: 8.5,
          order_accuracy: 85,
          communication: 3.5
        },
        total_sales: 4500000,
        orders_count: 234,
        review_count: 156,
        last_evaluated: '2025-12-10T11:00:00Z',
        trend: 'down'
      },
      {
        id: '5',
        business_name: 'Tanga Furniture Makers',
        tier: 'silver',
        current_grade: 'B',
        grade_score: 83,
        metrics: {
          response_rate: 92,
          on_time_delivery: 89,
          customer_satisfaction: 4.7,
          return_rate: 4.1,
          order_accuracy: 91,
          communication: 4.6
        },
        total_sales: 21200000,
        orders_count: 956,
        review_count: 534,
        last_evaluated: '2025-12-13T16:45:00Z',
        trend: 'stable'
      }
    ],
    grading_criteria: {
      response_rate: { weight: 15, threshold: 90 },
      on_time_delivery: { weight: 25, threshold: 85 },
      customer_satisfaction: { weight: 20, threshold: 4.0 },
      return_rate: { weight: 15, threshold: 5 },
      order_accuracy: { weight: 15, threshold: 90 },
      communication: { weight: 10, threshold: 4.0 }
    }
  };

  return <SellerGradingInteractive initialData={mockData} />;
}

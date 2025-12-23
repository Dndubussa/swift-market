/**
 * Simple test script for escrow service
 * This is a basic test to verify the escrow service functions work correctly
 */

// Mock supabase client for testing
const mockSupabase = {
  from: (table) => ({
    insert: (data) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { ...data, id: 'mock-id' }, error: null })
      })
    }),
    update: (data) => ({
      eq: (field, value) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { ...data, id: 'mock-id' }, error: null })
        })
      })
    }),
    select: (fields) => ({
      eq: (field, value) => ({
        single: () => Promise.resolve({ data: { id: 'mock-id', order_id: 'order-123', amount: 1000 }, error: null })
      })
    })
  })
};

// Mock the supabase import
jest.mock('../supabase', () => ({
  supabase: mockSupabase
}));

// Import the escrow service
const { 
  createEscrowAccount, 
  getEscrowAccountByOrderId, 
  fundEscrowAccount 
} = require('./escrowService');

describe('Escrow Service Tests', () => {
  test('should create escrow account', async () => {
    const orderData = {
      orderId: 'order-123',
      buyerId: 'buyer-123',
      vendorId: 'vendor-123',
      amount: 1000
    };

    const result = await createEscrowAccount(orderData);
    
    expect(result).toHaveProperty('id');
    expect(result.orderId).toBe('order-123');
    expect(result.amount).toBe(1000);
  });

  test('should get escrow account by order ID', async () => {
    const result = await getEscrowAccountByOrderId('order-123');
    
    expect(result).toHaveProperty('id');
    expect(result.orderId).toBe('order-123');
  });

  test('should fund escrow account', async () => {
    const paymentData = {
      paymentId: 'payment-123'
    };

    const result = await fundEscrowAccount('escrow-123', paymentData);
    
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('funded');
  });
});
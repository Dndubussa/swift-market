'use client';

import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase';

export default function SellerGradingPanel() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('grade');

  const supabase = createClient();

  useEffect(() => {
    fetchVendorsWithGrades();
  }, []);

  const calculateVendorGrade = (metrics) => {
    // Scoring system (0-100)
    let score = 100;

    // Dispute rate penalty (max -40 points)
    const disputeRate = metrics?.totalDisputes / Math.max(metrics?.totalOrders, 1);
    score -= Math.min(disputeRate * 100, 40);

    // Customer rating bonus (max +20 points)
    const avgRating = metrics?.averageRating || 0;
    score += (avgRating / 5) * 20;

    // Return frequency penalty (max -30 points)
    const returnRate = metrics?.totalReturns / Math.max(metrics?.totalOrders, 1);
    score -= Math.min(returnRate * 100, 30);

    // Payment compliance bonus (max +10 points)
    const paymentCompliance = metrics?.successfulPayments / Math.max(metrics?.totalPayments, 1);
    score += paymentCompliance * 10;

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Assign grade
    if (score >= 90) return { grade: 'A+', score, color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', score, color: 'text-green-500', bgColor: 'bg-green-50' };
    if (score >= 70) return { grade: 'B', score, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 60) return { grade: 'C', score, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (score >= 50) return { grade: 'D', score, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { grade: 'F', score, color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const fetchVendorsWithGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vendors with their products
      const { data: vendorsData, error: vendorsError } = await supabase?.from('vendors')?.select(`
          id,
          business_name,
          email,
          verification_status,
          products (id)
        `);

      if (vendorsError) throw vendorsError;

      // For each vendor, calculate metrics
      const vendorsWithGrades = await Promise.all(
        vendorsData?.map(async (vendor) => {
          // Fetch disputes
          const { data: disputes } = await supabase?.from('disputes')?.select('id, status')?.in('order_id', 
              (await supabase?.from('orders')?.select('id')?.eq('vendor_id', vendor?.id))?.data?.map(o => o?.id) || []
            );

          // Fetch returns
          const { data: returns } = await supabase?.from('returns')?.select('id, status')?.in('order_id',
              (await supabase?.from('orders')?.select('id')?.eq('vendor_id', vendor?.id))?.data?.map(o => o?.id) || []
            );

          // Fetch orders
          const { data: orders } = await supabase?.from('orders')?.select('id, status')?.eq('vendor_id', vendor?.id);

          // Fetch payments
          const { data: payments } = await supabase?.from('payments')?.select('id, payment_status')?.in('order_id', orders?.map(o => o?.id) || []);

          // Fetch reviews
          const { data: reviews } = await supabase?.from('reviews')?.select('rating')?.in('product_id', vendor?.products?.map(p => p?.id) || []);

          // Calculate metrics
          const metrics = {
            totalOrders: orders?.length || 0,
            totalDisputes: disputes?.length || 0,
            totalReturns: returns?.length || 0,
            totalPayments: payments?.length || 0,
            successfulPayments: payments?.filter(p => p?.payment_status === 'completed')?.length || 0,
            averageRating: reviews?.length > 0 
              ? reviews?.reduce((sum, r) => sum + r?.rating, 0) / reviews?.length 
              : 0,
            totalReviews: reviews?.length || 0
          };

          const gradeInfo = calculateVendorGrade(metrics);

          return {
            ...vendor,
            metrics,
            gradeInfo,
            productCount: vendor?.products?.length || 0
          };
        })
      );

      // Sort vendors
      const sorted = vendorsWithGrades?.sort((a, b) => {
        if (sortBy === 'grade') return b?.gradeInfo?.score - a?.gradeInfo?.score;
        if (sortBy === 'disputes') return b?.metrics?.totalDisputes - a?.metrics?.totalDisputes;
        if (sortBy === 'rating') return b?.metrics?.averageRating - a?.metrics?.averageRating;
        return 0;
      });

      setVendors(sorted);
    } catch (err) {
      console.error('Error fetching vendor grades:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Calculating seller grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Seller Quality Grading</h2>
            <p className="mt-1 text-sm text-gray-500">
              Auto-generated grades based on performance metrics
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e?.target?.value);
              fetchVendorsWithGrades();
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="grade">Sort by Grade</option>
            <option value="disputes">Sort by Disputes</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>
      {/* Grading Criteria Info */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <p className="text-sm text-blue-900 font-medium mb-2">Grading Criteria:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-800">
          <div>✓ Dispute Rate (40%)</div>
          <div>✓ Customer Ratings (20%)</div>
          <div>✓ Return Frequency (30%)</div>
          <div>✓ Payment Compliance (10%)</div>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Grade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Seller
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Orders
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Disputes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Returns
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment Compliance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendors?.map((vendor) => {
              const paymentCompliance = vendor?.metrics?.totalPayments > 0
                ? (vendor?.metrics?.successfulPayments / vendor?.metrics?.totalPayments * 100)?.toFixed(0)
                : 0;

              return (
                <tr key={vendor?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-lg font-bold rounded-lg ${vendor?.gradeInfo?.bgColor} ${vendor?.gradeInfo?.color}`}>
                        {vendor?.gradeInfo?.grade}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({vendor?.gradeInfo?.score?.toFixed(0)})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{vendor?.business_name}</div>
                    <div className="text-xs text-gray-500">{vendor?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor?.metrics?.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${vendor?.metrics?.totalDisputes > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {vendor?.metrics?.totalDisputes}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${vendor?.metrics?.totalReturns > 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {vendor?.metrics?.totalReturns}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {vendor?.metrics?.averageRating?.toFixed(1)}
                      </span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500">
                        ({vendor?.metrics?.totalReviews})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${paymentCompliance < 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {paymentCompliance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vendor?.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                      vendor?.verification_status === 'pending'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vendor?.verification_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {vendors?.map((vendor) => {
          const paymentCompliance = vendor?.metrics?.totalPayments > 0
            ? (vendor?.metrics?.successfulPayments / vendor?.metrics?.totalPayments * 100)?.toFixed(0)
            : 0;

          return (
            <div key={vendor?.id} className="px-6 py-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendor?.business_name}</p>
                  <p className="text-xs text-gray-500">{vendor?.email}</p>
                </div>
                <span className={`px-3 py-1 text-lg font-bold rounded-lg ${vendor?.gradeInfo?.bgColor} ${vendor?.gradeInfo?.color}`}>
                  {vendor?.gradeInfo?.grade}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Orders</p>
                  <p className="font-medium">{vendor?.metrics?.totalOrders}</p>
                </div>
                <div>
                  <p className="text-gray-500">Disputes</p>
                  <p className={`font-medium ${vendor?.metrics?.totalDisputes > 5 ? 'text-red-600' : ''}`}>
                    {vendor?.metrics?.totalDisputes}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Returns</p>
                  <p className={`font-medium ${vendor?.metrics?.totalReturns > 10 ? 'text-orange-600' : ''}`}>
                    {vendor?.metrics?.totalReturns}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="font-medium">{vendor?.metrics?.averageRating?.toFixed(1)}</p>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <p className={`font-medium ${paymentCompliance < 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {paymentCompliance}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    vendor?.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    vendor?.verification_status === 'pending'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {vendor?.verification_status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

SellerGradingPanel.propTypes = {};
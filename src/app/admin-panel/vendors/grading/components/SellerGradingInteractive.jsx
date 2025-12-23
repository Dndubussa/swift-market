'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function SellerGradingInteractive({ initialData }) {
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  const formatCurrency = (amount) => {
    return `TZS ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'bg-success/10 text-success border-success/20';
    if (grade.startsWith('B')) return 'bg-info/10 text-info border-info/20';
    if (grade.startsWith('C')) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return { icon: 'ArrowTrendingUpIcon', color: 'text-success' };
    if (trend === 'down') return { icon: 'ArrowTrendingDownIcon', color: 'text-error' };
    return { icon: 'MinusIcon', color: 'text-muted-foreground' };
  };

  const getMetricColor = (value, threshold, isReverse = false) => {
    const passes = isReverse ? value <= threshold : value >= threshold;
    return passes ? 'text-success' : 'text-error';
  };

  const filteredVendors = selectedGrade === 'all' 
    ? initialData?.vendors 
    : initialData?.vendors?.filter(v => {
        if (selectedGrade === 'excellent') return v.grade_score >= 90;
        if (selectedGrade === 'good') return v.grade_score >= 75 && v.grade_score < 90;
        if (selectedGrade === 'average') return v.grade_score >= 60 && v.grade_score < 75;
        if (selectedGrade === 'needs_improvement') return v.grade_score < 60;
        return true;
      }) || [];

  return (
    <DashboardLayout
      role="admin"
      title="Seller Grading"
      subtitle="Evaluate and grade vendor performance"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Vendors</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_vendors}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Excellent (A)</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.excellent}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Good (B)</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.good}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Average (C)</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.average}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Needs Work (D-F)</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.needs_improvement}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'excellent', 'good', 'average', 'needs_improvement'].map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGrade === grade
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {grade === 'all' ? 'All' : grade.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCriteriaModal(true)}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <Icon name="InformationCircleIcon" size={18} />
            Grading Criteria
          </button>
        </div>
      </div>

      {/* Vendors Grading Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Grade</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Response</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">On-Time</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Satisfaction</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Returns</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Accuracy</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Trend</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVendors.map((vendor) => {
                const trendInfo = getTrendIcon(vendor.trend);
                return (
                  <tr key={vendor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <Link
                          href={`/admin-panel/vendors/${vendor.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {vendor.business_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{vendor.orders_count} orders • {vendor.review_count} reviews</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-lg font-bold border ${getGradeColor(vendor.current_grade)}`}>
                          {vendor.current_grade}
                        </span>
                        <span className="text-sm text-muted-foreground">{vendor.grade_score}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getMetricColor(vendor.metrics.response_rate, initialData.grading_criteria.response_rate.threshold)}`}>
                        {vendor.metrics.response_rate}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getMetricColor(vendor.metrics.on_time_delivery, initialData.grading_criteria.on_time_delivery.threshold)}`}>
                        {vendor.metrics.on_time_delivery}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Icon name="StarIcon" size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className={`text-sm font-medium ${getMetricColor(vendor.metrics.customer_satisfaction, initialData.grading_criteria.customer_satisfaction.threshold)}`}>
                          {vendor.metrics.customer_satisfaction}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getMetricColor(vendor.metrics.return_rate, initialData.grading_criteria.return_rate.threshold, true)}`}>
                        {vendor.metrics.return_rate}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getMetricColor(vendor.metrics.order_accuracy, initialData.grading_criteria.order_accuracy.threshold)}`}>
                        {vendor.metrics.order_accuracy}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Icon name={trendInfo.icon} size={18} className={trendInfo.color} />
                        <span className="text-xs text-muted-foreground">{formatDate(vendor.last_evaluated)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin-panel/vendors/${vendor.id}`}
                        className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors inline-flex"
                        title="View Details"
                      >
                        <Icon name="EyeIcon" size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredVendors.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vendors found for the selected grade</p>
          </div>
        )}
      </div>

      {/* Grading Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Grading Criteria</h3>
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vendor grades are calculated based on a weighted average of the following metrics:
              </p>

              <div className="space-y-3">
                {Object.entries(initialData?.grading_criteria || {}).map(([key, value]) => (
                  <div key={key} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </h4>
                      <span className="text-sm font-semibold text-primary">{value.weight}% weight</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Threshold: {key === 'customer_satisfaction' || key === 'communication' ? value.threshold : `${value.threshold}%`}
                      {key === 'return_rate' ? ' (lower is better)' : ' (higher is better)'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Grade Scale</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">A+ / A:</span>
                    <span className="font-medium text-foreground">90-100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">B+ / B:</span>
                    <span className="font-medium text-foreground">75-89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">C+ / C:</span>
                    <span className="font-medium text-foreground">60-74%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">D / F:</span>
                    <span className="font-medium text-foreground">&lt; 60%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

SellerGradingInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    vendors: PropTypes.array,
    grading_criteria: PropTypes.object
  })
};

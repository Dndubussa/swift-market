'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

export default function SalesChart({ data }) {
  const [chartType, setChartType] = useState('line');
  const [dateRange, setDateRange] = useState('7days');

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Sales Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Track your sales performance over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e?.target?.value)}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            {dateRangeOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          <div className="flex items-center border border-input rounded-md overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-2 text-sm transition-colors duration-200 ${
                chartType === 'line' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="ChartBarIcon" size={18} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 text-sm transition-colors duration-200 ${
                chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="Squares2X2Icon" size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-80" aria-label="Sales Performance Chart">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECEF" />
              <XAxis dataKey="date" stroke="#7F8C8D" style={{ fontSize: '12px' }} />
              <YAxis stroke="#7F8C8D" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8ECEF',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="sales" stroke="#2D5A5A" strokeWidth={2} name="Sales (TZS)" />
              <Line type="monotone" dataKey="orders" stroke="#E67E22" strokeWidth={2} name="Orders" />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECEF" />
              <XAxis dataKey="date" stroke="#7F8C8D" style={{ fontSize: '12px' }} />
              <YAxis stroke="#7F8C8D" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8ECEF',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="sales" fill="#2D5A5A" name="Sales (TZS)" />
              <Bar dataKey="orders" fill="#E67E22" name="Orders" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

SalesChart.propTypes = {
  data: PropTypes?.arrayOf(
    PropTypes?.shape({
      date: PropTypes?.string?.isRequired,
      sales: PropTypes?.number?.isRequired,
      orders: PropTypes?.number?.isRequired,
    })
  )?.isRequired,
};
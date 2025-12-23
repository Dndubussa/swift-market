import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StoreAnalyticsDashboard({ analytics }) {
  const COLORS = ['#2D5A5A', '#E67E22', '#F39C12', '#27AE60', '#3498DB'];

  const statCards = [
    {
      label: 'Total Visitors',
      value: analytics?.totalVisitors?.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: 'UsersIcon',
      color: 'text-primary'
    },
    {
      label: 'Conversion Rate',
      value: `${analytics?.conversionRate}%`,
      change: '+2.3%',
      trend: 'up',
      icon: 'ChartBarIcon',
      color: 'text-success'
    },
    {
      label: 'Total Revenue',
      value: analytics?.totalRevenue,
      change: '+18.2%',
      trend: 'up',
      icon: 'CurrencyDollarIcon',
      color: 'text-secondary'
    },
    {
      label: 'Avg. Order Value',
      value: analytics?.avgOrderValue,
      change: '-3.1%',
      trend: 'down',
      icon: 'ShoppingCartIcon',
      color: 'text-accent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-muted ${stat?.color}`}>
                <Icon name={stat?.icon} size={20} />
              </div>
              <span className={`text-xs font-medium ${
                stat?.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat?.change}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground mb-1">{stat?.value}</p>
            <p className="text-sm text-muted-foreground">{stat?.label}</p>
          </div>
        ))}
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-card rounded-lg border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-foreground">Sales Trend</h3>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors duration-200">
              Export
            </button>
          </div>
          <div className="w-full h-64" aria-label="Monthly sales trend line chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECEF" />
                <XAxis dataKey="month" stroke="#7F8C8D" style={{ fontSize: '12px' }} />
                <YAxis stroke="#7F8C8D" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8ECEF',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2D5A5A"
                  strokeWidth={2}
                  dot={{ fill: '#2D5A5A', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-card rounded-lg border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-foreground">Top Products</h3>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors duration-200">
              View All
            </button>
          </div>
          <div className="w-full h-64" aria-label="Top selling products bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECEF" />
                <XAxis dataKey="name" stroke="#7F8C8D" style={{ fontSize: '12px' }} />
                <YAxis stroke="#7F8C8D" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8ECEF',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="sales" fill="#2D5A5A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Demographics */}
        <div className="bg-card rounded-lg border border-border shadow-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-6">Customer Demographics</h3>
          <div className="w-full h-64" aria-label="Customer demographics pie chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.demographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics?.demographics?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8ECEF',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg border border-border shadow-card p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className={`p-2 rounded-lg ${
                  activity?.type === 'sale' ? 'bg-success/10' :
                  activity?.type === 'review'? 'bg-accent/10' : 'bg-primary/10'
                }`}>
                  <Icon
                    name={
                      activity?.type === 'sale' ? 'ShoppingBagIcon' :
                      activity?.type === 'review'? 'StarIcon' : 'UserIcon'
                    }
                    size={16}
                    className={
                      activity?.type === 'sale' ? 'text-success' :
                      activity?.type === 'review'? 'text-accent' : 'text-primary'
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity?.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity?.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

StoreAnalyticsDashboard.propTypes = {
  analytics: PropTypes?.shape({
    totalVisitors: PropTypes?.number?.isRequired,
    conversionRate: PropTypes?.number?.isRequired,
    totalRevenue: PropTypes?.string?.isRequired,
    avgOrderValue: PropTypes?.string?.isRequired,
    salesTrend: PropTypes?.arrayOf(
      PropTypes?.shape({
        month: PropTypes?.string?.isRequired,
        sales: PropTypes?.number?.isRequired
      })
    )?.isRequired,
    topProducts: PropTypes?.arrayOf(
      PropTypes?.shape({
        name: PropTypes?.string?.isRequired,
        sales: PropTypes?.number?.isRequired
      })
    )?.isRequired,
    demographics: PropTypes?.arrayOf(
      PropTypes?.shape({
        name: PropTypes?.string?.isRequired,
        value: PropTypes?.number?.isRequired
      })
    )?.isRequired,
    recentActivity: PropTypes?.arrayOf(
      PropTypes?.shape({
        type: PropTypes?.string?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        time: PropTypes?.string?.isRequired
      })
    )?.isRequired
  })?.isRequired
};
'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function SupportTicketsInteractive({ initialData }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-info/10 text-info border-info/20',
      in_progress: 'bg-warning/10 text-warning border-warning/20',
      pending_customer: 'bg-muted text-muted-foreground border-muted',
      resolved: 'bg-success/10 text-success border-success/20',
      closed: 'bg-muted text-muted-foreground border-muted'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-error/10 text-error',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-info/10 text-info'
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      technical_issue: 'Technical Issue',
      account_issue: 'Account Issue',
      payment_issue: 'Payment Issue',
      order_issue: 'Order Issue',
      product_inquiry: 'Product Inquiry',
      general_inquiry: 'General Inquiry',
      feature_request: 'Feature Request',
      bug_report: 'Bug Report'
    };
    return labels[category] || category;
  };

  const filteredTickets = initialData?.tickets?.filter(ticket => {
    const statusMatch = selectedStatus === 'all' || ticket.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || ticket.priority === selectedPriority;
    const query = searchQuery.toLowerCase();
    const searchMatch = !query ||
      ticket.ticket_number.toLowerCase().includes(query) ||
      ticket.user_name.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query);

    return statusMatch && priorityMatch && searchMatch;
  }) || [];

  return (
    <DashboardLayout
      role="admin"
      title="Support Tickets"
      subtitle="Manage customer support tickets and inquiries"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_tickets}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Open</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.open}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-warning">{initialData?.summary?.in_progress}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Customer</p>
          <p className="text-2xl font-bold text-muted-foreground">{initialData?.summary?.pending_customer}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, user, or subject..."
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_customer">Pending Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing {filteredTickets.length} of {initialData?.tickets?.length || 0} tickets
        </p>
      </div>

      {/* Tickets Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Ticket ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Subject</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Priority</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Last Updated</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-sm font-medium text-foreground">{ticket.ticket_number}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ticket.user_name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.user_email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {ticket.user_type.charAt(0).toUpperCase() + ticket.user_type.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-sm font-medium text-foreground truncate" title={ticket.subject}>{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                    {ticket.assigned_to && (
                      <p className="text-xs text-info mt-1">
                        <Icon name="UserIcon" size={12} className="inline mr-1" />
                        {ticket.assigned_to}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{getCategoryLabel(ticket.category)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground">{formatDateTime(ticket.last_updated)}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/support/tickets/${ticket.id}`}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 inline-flex"
                        title="View & Respond"
                      >
                        <Icon name="ChatBubbleLeftIcon" size={14} />
                      </Link>
                      {ticket.status === 'open' && (
                        <button
                          className="p-2 bg-success text-white rounded-lg hover:bg-success/90 inline-flex"
                          title="Assign"
                        >
                          <Icon name="UserPlusIcon" size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tickets found matching your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

SupportTicketsInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    tickets: PropTypes.array
  })
};

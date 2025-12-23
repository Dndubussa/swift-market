'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import Icon from '@/components/ui/AppIcon';

export default function UserManagementInteractive({ initialData }) {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);

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

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-error/10 text-error border-error/20',
      vendor: 'bg-primary/10 text-primary border-primary/20',
      buyer: 'bg-success/10 text-success border-success/20'
    };
    return colors[role] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      suspended: 'bg-error/10 text-error border-error/20',
      pending: 'bg-warning/10 text-warning border-warning/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredUsers = initialData?.users?.filter(user => {
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    const statusMatch = selectedStatus === 'all' || user.status === selectedStatus;
    const verificationMatch = 
      selectedVerification === 'all' || 
      (selectedVerification === 'verified' && user.verified) ||
      (selectedVerification === 'unverified' && !user.verified);
    const searchMatch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return roleMatch && statusMatch && verificationMatch && searchMatch;
  }) || [];

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    const messages = {
      suspend: `User ${selectedUser.name} suspended`,
      activate: `User ${selectedUser.name} activated`,
      verify: `User ${selectedUser.name} verified`,
      delete: `User ${selectedUser.name} deleted`
    };
    alert(messages[actionType] || 'Action completed');
    setShowActionModal(false);
  };

  return (
    <DashboardLayout
      role="admin"
      title="User Management"
      subtitle="Manage all platform users"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{initialData?.summary?.total_users}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Buyers</p>
          <p className="text-2xl font-bold text-success">{initialData?.summary?.buyers}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Vendors</p>
          <p className="text-2xl font-bold text-primary">{initialData?.summary?.vendors}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Admins</p>
          <p className="text-2xl font-bold text-error">{initialData?.summary?.admins}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Today</p>
          <p className="text-2xl font-bold text-info">{initialData?.summary?.active_today}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">New This Month</p>
          <p className="text-2xl font-bold text-accent">{initialData?.summary?.new_this_month}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {initialData?.filters?.roles?.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {initialData?.filters?.statuses?.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Verification</label>
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {initialData?.filters?.verification?.map(ver => (
                <option key={ver} value={ver}>
                  {ver.charAt(0).toUpperCase() + ver.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Verified</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Activity</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Stats</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.verified ? (
                      <Icon name="CheckBadgeIcon" size={20} className="text-success" />
                    ) : (
                      <Icon name="XCircleIcon" size={20} className="text-muted-foreground" />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Joined: {formatDate(user.joined)}</p>
                      <p className="text-muted-foreground">Last: {formatDateTime(user.last_active)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-foreground">{user.orders_count} orders</p>
                      <p className="text-muted-foreground">{formatCurrency(user.total_spent)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleAction(user, 'suspend')}
                          className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                          title="Suspend User"
                        >
                          <Icon name="NoSymbolIcon" size={16} />
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => handleAction(user, 'activate')}
                          className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                          title="Activate User"
                        >
                          <Icon name="CheckCircleIcon" size={16} />
                        </button>
                      )}
                      {!user.verified && (
                        <button
                          onClick={() => handleAction(user, 'verify')}
                          className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                          title="Verify User"
                        >
                          <Icon name="CheckBadgeIcon" size={16} />
                        </button>
                      )}
                      <Link
                        href={user.role === 'vendor' ? `/admin-panel/vendors/${user.id}` : `#`}
                        className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        title="View Details"
                      >
                        <Icon name="EyeIcon" size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found matching your filters</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {actionType === 'suspend' && 'Suspend User'}
                {actionType === 'activate' && 'Activate User'}
                {actionType === 'verify' && 'Verify User'}
                {actionType === 'delete' && 'Delete User'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{selectedUser.name}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Email: {selectedUser.email}</p>
                  <p className="text-muted-foreground">Role: {selectedUser.role}</p>
                  <p className="text-muted-foreground">Orders: {selectedUser.orders_count}</p>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                actionType === 'suspend' || actionType === 'delete' 
                  ? 'bg-error/10 border-error/20' 
                  : 'bg-success/10 border-success/20'
              }`}>
                <p className="text-sm">
                  {actionType === 'suspend' && 'This will suspend the user account and restrict access.'}
                  {actionType === 'activate' && 'This will reactivate the user account.'}
                  {actionType === 'verify' && 'This will mark the user as verified.'}
                  {actionType === 'delete' && 'This action cannot be undone!'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  actionType === 'suspend' || actionType === 'delete'
                    ? 'bg-error text-white hover:bg-error/90'
                    : 'bg-success text-white hover:bg-success/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

UserManagementInteractive.propTypes = {
  initialData: PropTypes.shape({
    summary: PropTypes.object,
    users: PropTypes.array,
    filters: PropTypes.object
  })
};

import UserManagementInteractive from './components/UserManagementInteractive';

export const metadata = {
  title: 'User Management - Admin Panel',
  description: 'Manage all platform users'
};

export default function UserManagementPage() {
  const mockData = {
    summary: {
      total_users: 12456,
      buyers: 8234,
      vendors: 847,
      admins: 12,
      active_today: 3456,
      new_this_month: 892
    },
    users: [
      {
        id: '1',
        name: 'John Mwangi',
        email: 'john.mwangi@example.com',
        role: 'vendor',
        status: 'active',
        verified: true,
        joined: '2024-03-15T10:00:00Z',
        last_active: '2025-12-21T14:30:00Z',
        orders_count: 1245,
        total_spent: 25600000
      },
      {
        id: '2',
        name: 'Sarah Kimaro',
        email: 'sarah.kimaro@example.com',
        role: 'buyer',
        status: 'active',
        verified: true,
        joined: '2024-06-20T09:15:00Z',
        last_active: '2025-12-22T08:20:00Z',
        orders_count: 45,
        total_spent: 3200000
      },
      {
        id: '3',
        name: 'James Mollel',
        email: 'james.mollel@example.com',
        role: 'vendor',
        status: 'suspended',
        verified: true,
        joined: '2024-01-10T11:30:00Z',
        last_active: '2025-12-15T16:45:00Z',
        orders_count: 678,
        total_spent: 15400000
      },
      {
        id: '4',
        name: 'Mary Lyimo',
        email: 'mary.lyimo@example.com',
        role: 'buyer',
        status: 'active',
        verified: false,
        joined: '2025-12-10T14:20:00Z',
        last_active: '2025-12-21T10:15:00Z',
        orders_count: 3,
        total_spent: 450000
      },
      {
        id: '5',
        name: 'David Kamau',
        email: 'david.kamau@example.com',
        role: 'admin',
        status: 'active',
        verified: true,
        joined: '2023-08-05T08:00:00Z',
        last_active: '2025-12-22T00:30:00Z',
        orders_count: 0,
        total_spent: 0
      },
      {
        id: '6',
        name: 'Amina Juma',
        email: 'amina.juma@example.com',
        role: 'vendor',
        status: 'active',
        verified: true,
        joined: '2024-09-12T13:45:00Z',
        last_active: '2025-12-21T18:20:00Z',
        orders_count: 892,
        total_spent: 18900000
      }
    ],
    filters: {
      roles: ['all', 'buyer', 'vendor', 'admin'],
      statuses: ['all', 'active', 'suspended', 'pending'],
      verification: ['all', 'verified', 'unverified']
    }
  };

  return <UserManagementInteractive initialData={mockData} />;
}

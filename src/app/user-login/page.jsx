import LoginInteractive from './components/LoginInteractive';

export const metadata = {
  title: 'User Login - Blinno Marketplace',
  description: 'Sign in to your Blinno account to access Tanzania\'s premier multi-vendor marketplace. Shop from verified vendors with secure mobile money payments.'
};

export default function UserLoginPage() {
  const mockCredentials = [
    { identifier: 'buyer@blinno.com', password: 'Buyer@123', role: 'buyer', name: 'John Mwangi' },
    { identifier: '+255712345678', password: 'Buyer@123', role: 'buyer', name: 'John Mwangi' },
    { identifier: 'vendor@blinno.com', password: 'Vendor@123', role: 'vendor', name: 'Sarah Kimani' },
    { identifier: '+255723456789', password: 'Vendor@123', role: 'vendor', name: 'Sarah Kimani' },
    { identifier: 'admin@blinno.com', password: 'Admin@123', role: 'admin', name: 'David Omondi' }
  ];

  return <LoginInteractive mockCredentials={mockCredentials} />;
}
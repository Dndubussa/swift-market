import NotificationsCenterInteractive from '@/app/vendor-dashboard/notifications/components/NotificationsCenterInteractive';

export const metadata = {
  title: 'Notifications - Blinno Marketplace',
  description: 'View and manage all your notifications'
};

export default function BuyerNotificationsPage() {
  return <NotificationsCenterInteractive role="buyer" />;
}


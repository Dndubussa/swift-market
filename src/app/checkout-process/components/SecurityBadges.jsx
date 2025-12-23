import Icon from '@/components/ui/AppIcon';

export default function SecurityBadges() {
  const badges = [
    {
      icon: 'LockClosedIcon',
      title: 'SSL Encrypted',
      description: '256-bit encryption'
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Escrow Protected',
      description: 'Secure payment holding'
    },
    {
      icon: 'CheckBadgeIcon',
      title: 'ClickPesa Verified',
      description: 'Licensed payment gateway'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-heading font-bold text-foreground mb-4">Security & Trust</h3>
      <div className="space-y-4">
        {badges?.map((badge, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Icon name={badge?.icon} size={20} className="text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">{badge?.title}</h4>
              <p className="text-xs text-muted-foreground">{badge?.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-start space-x-2">
          <Icon name="InformationCircleIcon" size={18} className="text-accent mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How Escrow Works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Your payment is held securely</li>
              <li>Vendor ships your order</li>
              <li>You confirm receipt</li>
              <li>Payment released to vendor</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
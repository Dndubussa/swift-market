import Icon from '@/components/ui/AppIcon';

export default function SecurityFeatures() {
  const securityFeatures = [
    {
      icon: 'ShieldCheckIcon',
      title: 'Secure Authentication',
      description: 'Your data is protected with industry-standard encryption'
    },
    {
      icon: 'LockClosedIcon',
      title: 'Privacy Protected',
      description: 'We never share your personal information with third parties'
    },
    {
      icon: 'DevicePhoneMobileIcon',
      title: 'Mobile Verified',
      description: 'Two-factor authentication available for enhanced security'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
        <Icon name="ShieldCheckIcon" size={18} className="text-primary" />
        <span>Your Security Matters</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={feature?.icon} size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground mb-1">{feature?.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
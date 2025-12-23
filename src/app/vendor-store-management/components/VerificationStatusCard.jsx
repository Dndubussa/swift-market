import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function VerificationStatusCard({ verification }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-success bg-success/10 border-success/20';
      case 'pending':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'rejected':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return 'CheckCircleIcon';
      case 'pending':
        return 'ClockIcon';
      case 'rejected':
        return 'XCircleIcon';
      default:
        return 'DocumentIcon';
    }
  };

  const completedSteps = verification?.steps?.filter(step => step?.completed)?.length;
  const totalSteps = verification?.steps?.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-foreground">Verification Status</h3>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(verification?.status)}`}>
            <Icon name={getStatusIcon(verification?.status)} size={16} variant="solid" />
            {verification?.status?.charAt(0)?.toUpperCase() + verification?.status?.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Verification Progress</span>
            <span className="text-sm font-medium text-primary">{completedSteps}/{totalSteps} completed</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Verification Steps */}
        <div className="space-y-3">
          {verification?.steps?.map((step, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
                step?.completed
                  ? 'bg-success/5 border-success/20'
                  : step?.required
                  ? 'bg-warning/5 border-warning/20' :'bg-muted/30 border-border'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                step?.completed
                  ? 'bg-success/10'
                  : step?.required
                  ? 'bg-warning/10' :'bg-muted'
              }`}>
                <Icon
                  name={step?.completed ? 'CheckCircleIcon' : step?.icon}
                  size={20}
                  variant={step?.completed ? 'solid' : 'outline'}
                  className={
                    step?.completed
                      ? 'text-success'
                      : step?.required
                      ? 'text-warning' :'text-muted-foreground'
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground">{step?.title}</h4>
                  {step?.required && !step?.completed && (
                    <span className="text-xs font-medium text-warning">Required</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{step?.description}</p>
                {!step?.completed && step?.action && (
                  <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                    {step?.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Required Documents */}
        {verification?.requiredDocuments && verification?.requiredDocuments?.length > 0 && (
          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="DocumentTextIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Required Documents</h4>
                <ul className="space-y-1">
                  {verification?.requiredDocuments?.map((doc, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Icon name="DocumentIcon" size={14} />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {verification?.status !== 'verified' && (
          <button className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium shadow-card">
            Complete Verification
          </button>
        )}
      </div>
    </div>
  );
}

VerificationStatusCard.propTypes = {
  verification: PropTypes?.shape({
    status: PropTypes?.oneOf(['verified', 'pending', 'rejected', 'incomplete'])?.isRequired,
    steps: PropTypes?.arrayOf(
      PropTypes?.shape({
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        icon: PropTypes?.string?.isRequired,
        completed: PropTypes?.bool?.isRequired,
        required: PropTypes?.bool?.isRequired,
        action: PropTypes?.string
      })
    )?.isRequired,
    requiredDocuments: PropTypes?.arrayOf(PropTypes?.string)
  })?.isRequired
};
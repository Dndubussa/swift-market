import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function OrderTimelineStep({ step, isActive, isCompleted, isLast }) {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? 'bg-success text-success-foreground'
              : isActive
              ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isCompleted ? (
            <Icon name="CheckIcon" size={20} variant="solid" />
          ) : (
            <Icon name={step?.icon} size={20} />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-16 mt-2 transition-colors duration-300 ${
              isCompleted ? 'bg-success' : 'bg-border'
            }`}
          />
        )}
      </div>
      <div className="ml-4 flex-1 pb-8">
        <h3
          className={`text-sm font-semibold mb-1 ${
            isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
          }`}
        >
          {step?.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-1">{step?.description}</p>
        {step?.timestamp && (
          <p className="text-xs text-muted-foreground">
            {new Date(step.timestamp)?.toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
        {step?.action && (
          <p className="text-xs text-foreground mt-1">
            <span className="font-medium">Action by:</span> {step?.action}
          </p>
        )}
      </div>
    </div>
  );
}

OrderTimelineStep.propTypes = {
  step: PropTypes?.shape({
    title: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    icon: PropTypes?.string?.isRequired,
    timestamp: PropTypes?.string,
    action: PropTypes?.string,
  })?.isRequired,
  isActive: PropTypes?.bool?.isRequired,
  isCompleted: PropTypes?.bool?.isRequired,
  isLast: PropTypes?.bool?.isRequired,
};
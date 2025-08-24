import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Reusable Stepper Component
 * Provides consistent step navigation across the application
 * Following DRY principle and maintaining UI consistency
 */
const Stepper = ({
  steps = [],
  currentStep = 1,
  onStepClick,
  className = '',
  showArrows = true,
  variant = 'default', // 'default', 'compact', 'minimal'
  disabled = false,
}) => {
  const handleStepClick = (stepId) => {
    if (disabled || !onStepClick) return;
    onStepClick(stepId);
  };

  const getStepClasses = (step, isCompleted, isCurrent) => {
    const baseClasses = 'flex-1 flex flex-col items-center focus:outline-none transition-colors cursor-pointer';
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }

    if (isCurrent) {
      return `${baseClasses} font-bold text-indigo-600`;
    } else if (isCompleted) {
      return `${baseClasses} text-indigo-400`;
    } else {
      return `${baseClasses} text-gray-400`;
    }
  };

  const getCircleClasses = (isCompleted, isCurrent) => {
    const baseClasses = 'rounded-full w-8 h-8 flex items-center justify-center border-2 mb-1 relative';
    
    if (isCurrent) {
      return `${baseClasses} border-indigo-500 bg-white`;
    } else if (isCompleted) {
      return `${baseClasses} border-indigo-300 bg-white`;
    } else {
      return `${baseClasses} border-gray-300 bg-white`;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'mb-4';
      case 'minimal':
        return 'mb-2';
      default:
        return 'mb-8';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={getStepClasses(step, isCompleted, isCurrent)}
                onClick={() => handleStepClick(step.id)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={disabled}
                disabled={disabled}
                title={step.description || step.title}
              >
                <span className={getCircleClasses(isCompleted, isCurrent)}>
                  {isCompleted ? (
                    <CheckCircle size={16} className="text-indigo-500" />
                  ) : (
                    step.id
                  )}
                </span>
                <span className="truncate text-xs">{step.title}</span>
              </button>
              {showArrows && index < steps.length - 1 && (
                <span className="mx-2 flex-0 text-gray-300">&rarr;</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;


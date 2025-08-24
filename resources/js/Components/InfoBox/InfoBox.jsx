import React from "react";

/**
 * InfoBox Component
 *
 * Single Responsibility Principle: Only responsible for displaying informational content
 * Open/Closed Principle: Extensible through props without modifying the component
 * Liskov Substitution Principle: Can be used anywhere an info box is needed
 * Interface Segregation Principle: Only requires the props it actually uses
 * Dependency Inversion Principle: Depends on abstractions (props) not concrete implementations
 */
const InfoBox = ({
  type = "info", // 'info', 'success', 'warning', 'error'
  title,
  message,
  icon,
  className = "",
  children,
}) => {
  // Color schemes for different types
  const colorSchemes = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-400",
      title: "text-blue-700",
      message: "text-blue-600",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-400",
      title: "text-green-700",
      message: "text-green-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-400",
      title: "text-yellow-700",
      message: "text-yellow-600",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-400",
      title: "text-red-700",
      message: "text-red-600",
    },
  };

  const colors = colorSchemes[type] || colorSchemes.info;

  // Default icons for each type
  const defaultIcons = {
    info: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  const displayIcon = icon || defaultIcons[type] || defaultIcons.info;

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-md p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`${colors.icon}`}>{displayIcon}</div>
        </div>
        <div className="ml-3">
          {title && (
            <p className={`text-sm ${colors.title} font-medium`}>{title}</p>
          )}
          {message &&
            (typeof message === "string" || typeof message === "number" ? (
              <p className={`text-sm ${colors.message} ${title ? "mt-1" : ""}`}>
                {message}
              </p>
            ) : (
              <div
                className={`text-sm ${colors.message} ${title ? "mt-1" : ""}`}
              >
                {message}
              </div>
            ))}
          {children && (
            <div
              className={`text-sm ${colors.message} ${title || message ? "mt-2" : ""}`}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoBox;

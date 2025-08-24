import React from "react";

// Schedule type colors with accessibility considerations
const scheduleTypeColors = {
  single: {
    primary: "#3b82f6", // Blue
    light: "#dbeafe", // Light blue for hover
    dark: "#1e40af", // Dark blue for contrast
    text: "#ffffff", // White text for contrast
  },
  weekly: {
    primary: "#10b981", // Green
    light: "#d1fae5", // Light green for hover
    dark: "#047857", // Dark green for contrast
    text: "#ffffff", // White text for contrast
  },
  monthly: {
    primary: "#f59e0b", // Orange
    light: "#fed7aa", // Light orange for hover
    dark: "#d97706", // Dark orange for contrast
    text: "#ffffff", // White text for contrast
  },
};

// Accessibility-friendly color indicators for color blindness
const scheduleTypeIndicators = {
  single: "●", // Circle
  weekly: "■", // Square
  monthly: "◆", // Diamond
};

const ScheduleLegend = ({
  className = "",
  showTodayIndicator = true,
  todayColor = "#edce7e", // Use the color you specified
}) => {
  return (
    <div className={`flex items-center space-x-6 text-sm ${className}`}>
      <span className="font-medium text-gray-700">Schedule Types:</span>

      {Object.entries(scheduleTypeColors).map(([type, colors]) => (
        <div key={type} className="flex items-center space-x-2">
          <span
            className="text-gray-600 capitalize"
            style={{ color: colors.primary }}
          >
            {type}
          </span>
          <span
            className="text-lg font-bold"
            style={{ color: colors.primary }}
            aria-label={`${type} schedule indicator`}
          >
            {scheduleTypeIndicators[type]}
          </span>
        </div>
      ))}

      {showTodayIndicator && (
        <div className="flex items-center space-x-2 ml-4">
          <span className="font-medium text-gray-700">Today:</span>
          <span
            className="text-lg font-bold"
            style={{ color: todayColor }}
            aria-label="Today indicator"
          >
            ●
          </span>
        </div>
      )}
    </div>
  );
};

export default ScheduleLegend;

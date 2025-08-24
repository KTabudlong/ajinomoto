import React from "react";

/**
 * ColorLegend Component
 *
 * A reusable component for displaying day color legends.
 * Follows SOLID principles for maintainability and reusability.
 */
const ColorLegend = ({ dayColors = {}, className = "" }) => {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <span className="text-sm font-medium text-gray-700">Day Colors:</span>
      {dayLabels.map((label, index) => {
        const color = dayColors[index] || "#6B7280"; // Default gray if no color set
        return (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ColorLegend;

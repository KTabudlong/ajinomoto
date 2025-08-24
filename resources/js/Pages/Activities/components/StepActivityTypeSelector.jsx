import React from "react";

const StepActivityTypeSelector = ({ activityType, onChange }) => {
  const activityTypes = [
    {
      id: "single",
      name: "Single Event",
      description: "One-time activity on a specific date",
      icon: "📅",
    },
    {
      id: "quarterly_start",
      name: "Quarterly (Start of Quarter)",
      description: "Activity that starts on January 1st, April 1st, July 1st, October 1st",
      icon: "🏁",
    },
    {
      id: "quarterly_end",
      name: "Quarterly (End of Quarter)",
      description: "Activity that occurs at the end of each quarter (March 31st, June 30th, September 30th, December 31st)",
      icon: "🏁",
    },
    {
      id: "every_x_months",
      name: "Every X Months",
      description: "Activity that repeats every specified number of months",
      icon: "📆",
    },
    {
      id: "every_x_years",
      name: "Every X Years",
      description: "Activity that repeats every specified number of years",
      icon: "📅",
    },
    {
      id: "specific_dates",
      name: "Specific Dates",
      description: "Activity that occurs on specific dates throughout the year",
      icon: "📍",
    },
    {
      id: "annually_custom",
      name: "Annually (Custom Date)",
      description: "Activity that repeats annually on a specific date",
      icon: "🎯",
    },
    {
      id: "monthly",
      name: "Monthly",
      description: "Activity that occurs every month on the same date",
      icon: "📅",
    },
    {
      id: "every_x_days",
      name: "Every X Days",
      description: "Activity that repeats every specified number of days",
      icon: "📆",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select Activity Type
        </h2>
        <p className="text-gray-600">
          Choose how often this activity should occur. This will determine the date selection options in the next step.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activityTypes.map((type) => (
          <div
            key={type.id}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
              activityType === type.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => onChange(type.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{type.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </div>
            
            {activityType === type.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {activityType && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {activityTypes.find(t => t.id === activityType)?.name}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {activityTypes.find(t => t.id === activityType)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepActivityTypeSelector;

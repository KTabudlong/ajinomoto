import React from "react";

const StepReviewConfirm = ({
  activityType,
  activityTitle,
  startDate,
  endDate,
  frequencyConfig,
  selectedSite,
  selectedTopic,
  activityDescription,
  onConfirm,
  processing,
}) => {
  // Helper function to get activity type display name
  const getActivityTypeName = (type) => {
    const typeNames = {
      single: "Single Event",
      quarterly_start: "Quarterly (Start of Quarter)",
      quarterly_end: "Quarterly (End of Quarter)",
      every_x_months: "Every X Months",
      every_x_years: "Every X Years",
      specific_dates: "Specific Dates",
      annually_custom: "Annually (Custom Date)",
      monthly: "Monthly",
      every_x_days: "Every X Days",
    };
    return typeNames[type] || type;
  };

  // Helper function to format frequency config
  const formatFrequencyConfig = () => {
    if (!frequencyConfig || Object.keys(frequencyConfig).length === 0) {
      return "None";
    }

    const configs = [];
    
    if (frequencyConfig.interval) {
      configs.push(`Every ${frequencyConfig.interval} ${frequencyConfig.interval === 1 ? 'unit' : 'units'}`);
    }
    
    if (frequencyConfig.specificDates) {
      configs.push(`Specific dates: ${frequencyConfig.specificDates}`);
    }

    return configs.length > 0 ? configs.join(", ") : "None";
  };

  // Mock data for display (in real app, this would come from props or API)
  const mockSites = [
    { id: 1, name: "Main Office", city: "Chicago", state: "IL" },
    { id: 2, name: "Downtown Branch", city: "Chicago", state: "IL" },
    { id: 3, name: "North Branch", city: "Chicago", state: "IL" },
  ];

  const mockTopics = [
    { id: 1, name: "Team Meeting", subject: "General" },
    { id: 2, name: "Training Session", subject: "Professional Development" },
    { id: 3, name: "Client Review", subject: "Business" },
    { id: 4, name: "Maintenance", subject: "Operations" },
    { id: 5, name: "Planning Session", subject: "Strategy" },
  ];

  const selectedSiteData = mockSites.find(s => s.id == selectedSite);
  const selectedTopicData = mockTopics.find(t => t.id == selectedTopic);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Review & Confirm
        </h2>
        <p className="text-gray-600">
          Please review all the details before creating your activity. You can go back to any step to make changes.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        {/* Activity Title */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Title</h3>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="text-gray-900 font-medium">{activityTitle || "No title provided"}</p>
          </div>
        </div>

        {/* Activity Type */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Type</h3>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="text-gray-900 font-medium">{getActivityTypeName(activityType)}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
          <div className="bg-white p-4 rounded-md border border-gray-200 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="text-gray-900 font-medium">
                {startDate ? startDate.toLocaleDateString() : "Not set"}
              </span>
            </div>
            {endDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="text-gray-900 font-medium">
                  {endDate.toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Frequency Config:</span>
              <span className="text-gray-900 font-medium">
                {formatFrequencyConfig()}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Details</h3>
          <div className="bg-white p-4 rounded-md border border-gray-200 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Site:</span>
              <span className="text-gray-900 font-medium">
                {selectedSiteData ? `${selectedSiteData.name} - ${selectedSiteData.city}, ${selectedSiteData.state}` : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Topic:</span>
              <span className="text-gray-900 font-medium">
                {selectedTopicData ? `${selectedTopicData.name} (${selectedTopicData.subject})` : "Not selected"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block mb-2">Description:</span>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-gray-900">
                  {activityDescription || "No description provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Ready to Create</h4>
              <p className="text-sm text-blue-700 mt-1">
                All required information has been provided. Click the button below to create your activity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={onConfirm}
          disabled={processing}
          className="px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Activity...
            </div>
          ) : (
            "Create Activity"
          )}
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          After creation, you can view and manage your activities from the main activities page.
        </p>
        <p className="mt-1">
          You can also import activities in bulk using the Google Sheets import feature.
        </p>
      </div>
    </div>
  );
};

export default StepReviewConfirm;

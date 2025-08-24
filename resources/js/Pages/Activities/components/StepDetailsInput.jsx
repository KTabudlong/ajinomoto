import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

const StepDetailsInput = ({
  activityTitle,
  selectedSite,
  selectedTopic,
  activityDescription,
  onTitleChange,
  onSiteChange,
  onTopicChange,
  onDescriptionChange,
}) => {
  const [sites, setSites] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sites and topics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you'd fetch this from your API
        // For now, we'll use mock data
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

        setSites(mockSites);
        setTopics(mockTopics);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading options...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Activity Details
        </h2>
        <p className="text-gray-600">
          Provide the location, topic, and description for your activity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Activity Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter a descriptive title for your activity..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {activityTitle.length}/100 characters
          </p>
        </div>

        {/* Site Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Site <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSite}
            onChange={(e) => onSiteChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Choose a site...</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} - {site.city}, {site.state}
              </option>
            ))}
          </select>
          {selectedSite && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {sites.find(s => s.id == selectedSite)?.name}
            </p>
          )}
        </div>

        {/* Topic Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Topic <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Choose a topic...</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name} ({topic.subject})
              </option>
            ))}
          </select>
          {selectedTopic && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {topics.find(t => t.id == selectedTopic)?.name}
            </p>
          )}
        </div>

        {/* Activity Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={activityDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe what this activity is about, any special requirements, or additional details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="4"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {activityDescription.length}/1000 characters
          </p>
        </div>

        {/* Preview Card */}
        {(activityTitle || selectedSite || selectedTopic || activityDescription) && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
            <div className="space-y-2 text-sm">
              {activityTitle && (
                <div className="flex">
                  <span className="font-medium text-gray-700 w-20">Title:</span>
                  <span className="text-gray-600">
                    {activityTitle}
                  </span>
                </div>
              )}
              {selectedSite && (
                <div className="flex">
                  <span className="font-medium text-gray-700 w-20">Site:</span>
                  <span className="text-gray-600">
                    {sites.find(s => s.id == selectedSite)?.name}
                  </span>
                </div>
              )}
              {selectedTopic && (
                <div className="flex">
                  <span className="font-medium text-gray-700 w-20">Topic:</span>
                  <span className="text-gray-600">
                    {topics.find(t => t.id == selectedTopic)?.name}
                  </span>
                </div>
              )}
              {activityDescription && (
                <div className="flex">
                  <span className="font-medium text-gray-700 w-20">Description:</span>
                  <span className="text-gray-600 flex-1">
                    {activityDescription.length > 100 
                      ? `${activityDescription.substring(0, 100)}...` 
                      : activityDescription}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepDetailsInput;

import React from "react";

const ScheduleTooltip = ({ visible = false, content = "" }) => {
  if (!visible || !content) return null;

  // Parse content to separate date header from timeslots
  const parseContent = (content) => {
    if (content.startsWith("No schedules on")) {
      return { dateHeader: content, timeslots: [] };
    }

    // Split by colon to separate date from times
    const parts = content.split(": ");
    if (parts.length === 2) {
      const dateHeader = parts[0];
      const timeslots = parts[1].split(", ");
      return { dateHeader, timeslots };
    }

    return { dateHeader: content, timeslots: [] };
  };

  const { dateHeader, timeslots } = parseContent(content);

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-gray-200 shadow-lg max-w">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{dateHeader}</h3>
      {timeslots.length > 0 ? (
        <ul className="text-sm text-gray-700 space-y-2">
          {timeslots.map((timeslot, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
              {timeslot}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600 italic">No scheduled times</p>
      )}
    </div>
  );
};

export default ScheduleTooltip;

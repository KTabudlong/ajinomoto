import React, { useState } from "react";
import CustomCalendar from "./CustomCalendar";

const CustomCalendarExamples = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [originalDates, setOriginalDates] = useState([
    new Date(2025, 7, 15),
    new Date(2025, 7, 16),
  ]);

  // Mock schedule data
  const mockSchedules = [
    {
      start_time: "2025-08-10 09:00:00",
      end_time: "2025-08-10 12:00:00",
    },
    {
      start_time: "2025-08-12 14:00:00",
      end_time: "2025-08-12 17:00:00",
    },
  ];

  const mockSettings = {
    dayColors: {
      0: "#EF4444", // Sunday - Red
      1: "#F59E0B", // Monday - Amber
      2: "#10B981", // Tuesday - Green
      3: "#3B82F6", // Wednesday - Blue
      4: "#8B5CF6", // Thursday - Purple
      5: "#F97316", // Friday - Orange
      6: "#EC4899", // Saturday - Pink
    },
    timeFormat: "12h",
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">
        CustomCalendar Examples
      </h1>

      {/* Example 1: Basic Create Mode */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">
          1. Basic Create Mode (Single Schedule)
        </h2>
        <CustomCalendar
          selectedDates={selectedDates}
          onDateSelect={setSelectedDates}
          schedules={mockSchedules}
          settings={mockSettings}
          scheduleType="single"
          mode="create"
          className="w-full max-w-md"
          ariaLabel="Basic Create Calendar"
        />
        <p className="text-sm text-gray-600 mt-2">
          Selected:{" "}
          {selectedDates.length > 0 ? selectedDates[0].toDateString() : "None"}
        </p>
      </div>

      {/* Example 2: Edit Mode with Changes */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">
          2. Edit Mode with Changes
        </h2>
        <CustomCalendar
          selectedDates={selectedDates}
          originalDates={originalDates}
          schedules={mockSchedules}
          settings={mockSettings}
          scheduleType="single"
          mode="edit"
          className="w-full max-w-md"
          ariaLabel="Edit Mode Calendar"
        />
        <p className="text-sm text-gray-600 mt-2">
          Original: {originalDates.map((d) => d.toDateString()).join(", ")}
        </p>
      </div>

      {/* Example 3: Weekly Schedule Mode */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">3. Weekly Schedule Mode</h2>
        <CustomCalendar
          selectedDates={selectedDates}
          onDateSelect={setSelectedDates}
          schedules={mockSchedules}
          settings={mockSettings}
          scheduleType="weekly"
          mode="create"
          className="w-full max-w-md"
          ariaLabel="Weekly Schedule Calendar"
        />
      </div>

      {/* Example 4: Read-only View Mode */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">4. Read-only View Mode</h2>
        <CustomCalendar
          selectedDates={[
            new Date(2025, 7, 15),
            new Date(2025, 7, 16),
            new Date(2025, 7, 17),
          ]}
          schedules={mockSchedules}
          settings={mockSettings}
          scheduleType="single"
          mode="view"
          showTooltips={false}
          showScheduleDots={false}
          className="w-full max-w-md"
          ariaLabel="View Mode Calendar"
        />
      </div>

      {/* Example 5: Custom Styling */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">5. Custom Styling</h2>
        <CustomCalendar
          selectedDates={selectedDates}
          onDateSelect={setSelectedDates}
          schedules={mockSchedules}
          settings={mockSettings}
          scheduleType="single"
          mode="create"
          className="w-full max-w-md border-2 border-blue-300 rounded-xl"
          ariaLabel="Custom Styled Calendar"
        />
      </div>
    </div>
  );
};

export default CustomCalendarExamples;

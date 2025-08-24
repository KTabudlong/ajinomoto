import React, { useEffect } from "react";
import { colorUtils, scheduleUtils, timeUtils } from "../utils";
import StepReviewCalendar from "./StepReviewCalendar";
import StepReviewColorLegend from "./StepReviewColorLegend";

const StepReviewConfirm = ({
  scheduleType,
  selectedDates = [],
  selectedTime,
  settings = {},
  onConfirm,
  processing = false,
  mode = "create",
  originalData = null,
  changes = null,
  scheduleId = null,
}) => {
  useEffect(() => {}, [mode]);

  // Extract settings with fallbacks
  const { dayColors = {}, timeFormat = "12h", slotDuration = 60 } = settings;

  // Helper function to format date list with smart month/year handling
  const formatDateList = (dates) => {
    if (!dates || dates.length === 0) return "";

    // Sort dates to ensure proper order
    const sortedDates = [...dates].sort((a, b) => a - b);

    // Check if all dates are in the same month and year
    const firstDate = sortedDates[0];
    const allSameMonth = sortedDates.every(
      (date) =>
        date.getMonth() === firstDate.getMonth() &&
        date.getFullYear() === firstDate.getFullYear(),
    );

    if (allSameMonth) {
      // All dates in same month: "Aug 18, 20, 22"
      const monthName = firstDate.toLocaleDateString("en-US", {
        month: "short",
      });
      const year = firstDate.getFullYear();
      const days = sortedDates.map((date) => date.getDate()).join(", ");
      return `${monthName} ${days}, ${year}`;
    } else {
      // Dates span multiple months: "Aug 28, 30, Sept 1, 3, 2025"
      const year = firstDate.getFullYear();
      const formattedDates = sortedDates.map((date) => {
        const monthName = date.toLocaleDateString("en-US", { month: "short" });
        const day = date.getDate();
        return `${monthName} ${day}`;
      });
      return `${formattedDates.join(", ")}, ${year}`;
    }
  };

  // Handle delete mode
  if (mode === "delete") {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Delete Schedule Confirmation
        </h2>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-red-800">
                Warning: This action cannot be undone
              </span>
            </div>
            <div className="text-red-700 text-sm">
              You are about to delete this schedule. This action will
              permanently remove all associated data.
            </div>
          </div>

          {/* Schedule Type */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-900">
              Schedule Type:
            </div>
            <div className="text-sm text-gray-700 capitalize">
              {scheduleType}
            </div>
          </div>

          {/* Dates to be Deleted */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-900">
              Dates to be Deleted:
            </div>
            {selectedDates && selectedDates.length > 0 ? (
              <div className="space-y-4">
                {/* Calendar View with Red Styling */}
                <StepReviewCalendar
                  selectedDates={selectedDates}
                  originalDates={[]}
                  dayColors={dayColors}
                  scheduleType={scheduleType}
                  mode="delete"
                />

                {/* Date Count */}
                <div className="text-sm text-gray-600">
                  {selectedDates.length} date
                  {selectedDates.length !== 1 ? "s" : ""} will be deleted
                </div>
              </div>
            ) : (
              <span className="text-gray-500 text-sm">No dates selected</span>
            )}
          </div>

          {/* Time Information */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-900">
              Schedule Time:
            </div>
            <div className="text-sm text-gray-700">
              {selectedTime && selectedTime.start && selectedTime.end
                ? `${timeUtils.formatTime(
                    selectedTime.start,
                    timeFormat,
                  )} - ${timeUtils.formatTime(selectedTime.end, timeFormat)}`
                : "No time information"}
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-sm">
            <div className="font-semibold text-red-800 mb-2">
              Confirm Deletion
            </div>
            <div className="text-red-700">
              Please review the details above. Click "Delete Schedule" in the
              footer to permanently delete this schedule.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>

      <div className="space-y-6">
        {/* Schedule Type */}
        <div>
          <div className="mb-2 text-sm font-medium text-indigo-900">
            Schedule Type:
          </div>
          <div className="text-sm text-gray-700 capitalize">{scheduleType}</div>
        </div>

        {/* Selected Dates - Calendar View */}
        <div>
          <div className="mb-2 text-sm font-medium text-indigo-900">
            Selected Dates:
          </div>
          {selectedDates && selectedDates.length > 0 ? (
            <div className="space-y-4">
              {/* Color Legend */}
              <StepReviewColorLegend mode={mode} />

              {/* Calendar View */}
              <StepReviewCalendar
                selectedDates={selectedDates}
                originalDates={
                  mode === "edit" && originalData
                    ? originalData.selectedDates.map((date) => new Date(date))
                    : []
                }
                dayColors={dayColors}
                scheduleType={scheduleType}
                mode={mode}
              />
            </div>
          ) : (
            <span className="text-gray-500 text-sm">None</span>
          )}
        </div>

        {/* Selected Time */}
        <div>
          <div className="mb-2 text-sm font-medium text-indigo-900">
            Selected Time:
          </div>
          <div className="text-sm text-gray-700">
            {selectedTime && selectedTime.start && selectedTime.end
              ? `${timeUtils.formatTime(
                  selectedTime.start,
                  timeFormat,
                )} - ${timeUtils.formatTime(selectedTime.end, timeFormat)}`
              : "None selected"}
          </div>
        </div>

        {/* Settings Summary */}
        <div>
          <div className="mb-2 text-sm font-medium text-indigo-900">
            Settings:
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>Time Format: {timeFormat}</div>
            <div>Slot Duration: {slotDuration} minutes</div>
          </div>
        </div>

        {/* Change Summary for Edit Mode */}
        {mode === "edit" && changes && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-indigo-900">
              Changes Summary:
            </div>

            {/* Time Changes */}
            {changes.time.changed && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">
                      Original Time:
                    </div>
                    <div className="text-red-600 font-medium">
                      {originalData.selectedTime.start &&
                      originalData.selectedTime.end
                        ? `${timeUtils.formatTime(
                            originalData.selectedTime.start,
                            timeFormat,
                          )} - ${timeUtils.formatTime(
                            originalData.selectedTime.end,
                            timeFormat,
                          )}`
                        : "None"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">
                      New Time:
                    </div>
                    <div className="text-green-600 font-medium">
                      {selectedTime.start && selectedTime.end
                        ? `${timeUtils.formatTime(
                            selectedTime.start,
                            timeFormat,
                          )} - ${timeUtils.formatTime(
                            selectedTime.end,
                            timeFormat,
                          )}`
                        : "None"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Message */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-sm">
          <div className="font-semibold text-green-800 mb-2">
            {mode === "edit"
              ? "Ready to Update Schedule"
              : "Ready to Create Schedule"}
          </div>
          <div className="text-green-700">
            Please review the details above. Click "
            {mode === "edit" ? "Update" : "Create"} Schedule" in the footer to{" "}
            {mode === "edit" ? "update" : "create"} your schedule.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepReviewConfirm;

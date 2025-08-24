import React, { useMemo } from "react";
import {
  format,
  getYear,
  getMonth,
  setYear,
  setMonth,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  getDay,
  startOfDay,
} from "date-fns";
import { colorUtils } from "../utils";

// Use Monday as the first day of the week for consistency
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const StepReviewCalendar = ({
  selectedDates = [],
  originalDates = [],
  dayColors = {},
  scheduleType = "single",
  mode = "create",
}) => {
  // Get the month/year from the first selected date
  const calendarDate = useMemo(() => {
    if (selectedDates.length > 0) {
      return selectedDates[0];
    }
    return new Date();
  }, [selectedDates]);

  const year = getYear(calendarDate);
  const month = getMonth(calendarDate);

  // Check if dates span multiple months
  const dateRange = useMemo(() => {
    if (selectedDates.length === 0) return null;

    const sortedDates = [...selectedDates].sort(
      (a, b) => new Date(a) - new Date(b),
    );
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);

    const firstMonth = firstDate.getMonth();
    const firstYear = firstDate.getFullYear();
    const lastMonth = lastDate.getMonth();
    const lastYear = lastDate.getFullYear();

    if (firstMonth !== lastMonth || firstYear !== lastYear) {
      return {
        start: firstDate,
        end: lastDate,
      };
    }
    return null;
  }, [selectedDates]);

  // Determine the status of each date
  const getDateStatus = (date) => {
    // Normalize dates to start of day for comparison
    const normalizedDate = startOfDay(date);
    const isSelected = selectedDates.some((d) =>
      isSameDay(startOfDay(d), normalizedDate),
    );
    const isOriginal = originalDates.some((d) =>
      isSameDay(startOfDay(d), normalizedDate),
    );

    if (mode === "delete") {
      return isSelected ? "delete" : "none";
    } else if (mode === "create") {
      return isSelected ? "new" : "none";
    } else {
      // Edit mode
      if (isSelected && isOriginal) {
        return "unchanged";
      } else if (isSelected && !isOriginal) {
        return "added";
      } else if (!isSelected && isOriginal) {
        return "removed";
      } else {
        return "none";
      }
    }
  };

  // Get color for date status
  const getDateColor = (status, date) => {
    const dayOfWeek = getDay(date);
    const dayColor = colorUtils.getDayColors(dayColors)[dayOfWeek] || "#6B7280";

    switch (status) {
      case "new":
      case "added":
        return "#10B981"; // green-500
      case "removed":
        return "#EF4444"; // red-500
      case "unchanged":
        return "#6B7280"; // gray-500 for unchanged dates
      case "delete":
        return "#EF4444"; // red-500 for delete mode
      default:
        return "#F3F4F6"; // gray-100
    }
  };

  // Get text color for date status
  const getTextColor = (status) => {
    switch (status) {
      case "new":
      case "added":
      case "removed":
      case "unchanged":
        return "text-white";
      default:
        return "text-gray-400";
    }
  };

  // Get border color for date status
  const getBorderColor = (status) => {
    switch (status) {
      case "new":
      case "added":
        return "border-green-500";
      case "removed":
        return "border-red-500";
      case "unchanged":
        return "border-gray-300";
      default:
        return "border-gray-200";
    }
  };

  return (
    <div className="max-w-md">
      {/* Month/Year Header */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {dateRange
            ? `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`
            : format(calendarDate, "MMMM yyyy")}
        </h3>
      </div>

      {/* Calendar */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {dayLabels.map((label, idx) => {
            // Map Monday-first header index to JS getDay index (Sun=0..Sat=6)
            const jsDayIndex = (idx + 1) % 7; // Mon->1, Tue->2, ..., Sun->0
            const dayColor =
              colorUtils.getDayColors(dayColors)[jsDayIndex] || "#6B7280";

            return (
              <div
                key={label}
                className="px-1 py-2 text-xs font-semibold text-center sm:px-2 sm:py-2 sm:text-sm"
                style={{ backgroundColor: dayColor, color: "white" }}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {(() => {
            // Get all dates for the month
            const start = startOfMonth(
              setYear(setMonth(new Date(), month), year),
            );
            const end = endOfMonth(start);
            const allDates = eachDayOfInterval({ start, end });

            // Get the day of week for the first date (0 = Sunday, 1 = Monday, etc.)
            const firstDayOfWeek = start.getDay();
            // Convert to Monday-first index: Sun(0)->6, Mon(1)->0, ..., Sat(6)->5
            const firstDayMondayIndex = (firstDayOfWeek + 6) % 7;

            // Create calendar grid with empty cells for days before the month starts
            const calendarDays = [];

            // Add empty cells for days before the month starts
            for (let i = 0; i < firstDayMondayIndex; i++) {
              calendarDays.push(null);
            }

            // Add all dates in the month
            calendarDays.push(...allDates);

            return calendarDays.map((date, index) => {
              if (!date) {
                // Empty cell
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square border-r border-b border-gray-100"
                  ></div>
                );
              }

              const status = getDateStatus(date);
              const backgroundColor = getDateColor(status, date);
              const textColor = getTextColor(status);
              const borderColor = getBorderColor(status);

              return (
                <div
                  key={date.toISOString()}
                  className={`aspect-square border-r border-b border-gray-100 p-1 ${borderColor}`}
                >
                  <div
                    className={`w-full h-full rounded text-xs font-medium flex items-center justify-center ${textColor} sm:text-sm`}
                    style={{ backgroundColor }}
                  >
                    <span className="block text-center leading-none">
                      {format(date, "d")}
                    </span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default StepReviewCalendar;

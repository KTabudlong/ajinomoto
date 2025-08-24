import React, { useState, useEffect, useMemo, useRef } from "react";
import { format, isSameDay } from "date-fns";
import MonthlyScheduleSelector from "./MonthlyScheduleSelector";
import InfoBox from "@/Components/InfoBox/InfoBox";
import ColorLegend from "@/Components/ColorLegend/ColorLegend";
import CustomCalendar from "@/Components/CustomCalendar";
import ScheduleTooltip from "@/Components/ScheduleTooltip";
import { scheduleUtils, colorUtils, getBufferInfo } from "@/Pages/Schedules/utils";

const StepDateSelector = ({
  selectedDates = [],
  onSelectDate,
  schedules = [],
  settings = {},
  loading,
  error,
  scheduleType = "single",
  // Weekly-specific props
  selectedDays = [],
  weekDates = [],
  onWeekDateSelect = null,
  onDayToggle = null,
  loadedMonths = {},
  // Monthly-specific props
  monthlyYear = new Date().getFullYear(),
  monthlyMonth = new Date().getMonth(),
  monthlyDaysOfWeek = [1, 2, 3, 4, 5],
  onMonthlyMonthSelect = null,
  onDateSelectionChange = null,
  // Edit mode props
  mode = "create",
  originalData = null,
  scheduleId = null,
}) => {
  // Extract settings with fallbacks
  const { dayColors = {}, timeFormat = "12h" } = settings;
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());
  const [timeConstraintData, setTimeConstraintData] = useState(null);

  // Tooltip state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");

  const calendarRef = useRef(null);

  // Use visibleSchedules like legacy code (schedules for current month)
  const visibleSchedules = schedules || [];

  // Update displayed month/year when monthly schedule changes
  useEffect(() => {
    if (scheduleType === "monthly") {
      setDisplayedMonth(monthlyMonth);
      setDisplayedYear(monthlyYear);
    }
  }, [scheduleType, monthlyMonth, monthlyYear]);

  // Handle date selection
  const handleDateSelect = (date) => {


    // Ensure we have a valid Date object
    let validDate = null;
    if (date instanceof Date) {
      validDate = date;
    } else if (Array.isArray(date) && date.length > 0) {
      // react-calendar sometimes passes an array
      validDate = date[0] instanceof Date ? date[0] : new Date(date[0]);
    } else if (typeof date === "string") {
      validDate = new Date(date);
    } else {
      console.warn('Invalid date received:', date);
      return;
    }

    // Validate the date
    if (!validDate || isNaN(validDate.getTime())) {
      console.warn('Invalid date after conversion:', date);
      return;
    }

    // Helper function to ensure we have Date objects
    const ensureDateObject = (d) => {
      if (d instanceof Date) return d;
      if (typeof d === "string") {
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    };

    // Check if today is blocked by buffer before allowing selection
    const today = new Date();
    const isToday = validDate.toDateString() === today.toDateString();
    
    // Only apply buffer restriction if the selected date is today
    if (isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration) {
      const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
      if (!bufferInfo.isTodayBookable) {
        // Don't allow selection of today when buffer blocks it
        return;
      }
    }

    if (scheduleType === "single") {
      onSelectDate([validDate]);
    } else if (scheduleType === "weekly") {
      // For weekly schedules, handle like legacy: select all available dates in the week
      if (onWeekDateSelect) {
        onWeekDateSelect(validDate);
      } else {
        // Fallback: just select the single date
        onSelectDate([validDate]);
      }
    } else {
      // For other types, toggle selection
      const exists = selectedDates.some((d) => {
        const dateObj = ensureDateObject(d);
        return dateObj && dateObj.toDateString() === validDate.toDateString();
      });
      if (exists) {
        onSelectDate(
          selectedDates
            .filter((d) => {
              const dateObj = ensureDateObject(d);
              return !dateObj || dateObj.toDateString() !== validDate.toDateString();
            })
            .filter((d) => ensureDateObject(d) !== null), // Remove any null values
        );
      } else {
        onSelectDate([...selectedDates, validDate]);
      }
    }
  };

  // Handle tooltip hover events from calendar
  const handleDateHover = (date, content) => {
    if (date && date instanceof Date && !isNaN(date.getTime()) && content) {
      setTooltipContent(content);
      setTooltipVisible(true);
    } else {
      setTooltipVisible(false);
    }
  };

  // Handle calendar month navigation
  const handleActiveStartDateChange = ({ month, year, date }) => {
    if (typeof month === 'number' && typeof year === 'number') {
      setDisplayedMonth(month);
      setDisplayedYear(year);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Select Dates
        <span className="text-sm font-normal text-gray-600 ml-2">
          ({scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)}{" "}
          Schedule)
        </span>
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Unified Info Box - Date Selection, Tips, and Buffer Information */}
      <div className="mb-4 p-4 bg-blue-50 rounded border">
        <h3 className="text-sm font-medium text-blue-900 mb-3">📅 Schedule Information</h3>
        
        {/* Date Selection Info */}
        <div className="mb-3 pl-0">
          <p className="text-sm text-blue-800">
            Select {scheduleType === "single" ? "a date" : "dates"} for your schedule. 
            Dates with existing schedules are marked with red dots.
          </p>
        </div>

        {/* Schedule Type Tips */}
        <div className="mb-3 pl-0">
          <p className="text-sm text-blue-800">
            {scheduleType === "weekly"
              ? "💡 Weekly schedules: When selecting a week, only days without existing schedules will be selected."
              : scheduleType === "monthly"
                ? "💡 Monthly schedules: Select days of the week and specific dates for your monthly pattern."
                : "💡 Single schedules: Choose the best date for your schedule."}
          </p>
          
          {scheduleType === "monthly" && (
            <ul className="text-xs text-blue-700 mt-2 space-y-1 pl-4">
              <li>• Click day headers (Sun, Mon, etc.) to select/deselect all available dates</li>
              <li>• Click individual dates to select/deselect specific dates</li>
              <li>• Past dates and scheduled dates are automatically disabled</li>
            </ul>
          )}
        </div>

        {/* Time Buffer Information */}
        {settings.timeBuffer && (() => {
          const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
          return (
            <div className="pt-3 border-t border-blue-200 pl-0">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 text-sm">⏰</span>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Time Buffer Restriction</p>
                  <p>Schedules must be created at least <strong>{settings.timeBuffer} hours</strong> in advance.</p>
                  <p className="text-blue-600 mt-1">
                    {bufferInfo.todayStatus}
                  </p>
                  {bufferInfo.isTodayBookable && (
                    <p className="text-blue-500 mt-1">
                      Earliest allowed time: <strong>{bufferInfo.nextAvailableTime}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main Layout: Calendar on left, info on right */}
      <div className="flex gap-8">
        {/* Left Side: Calendar or Specialized Selector */}
        <div className="flex-1">
          {scheduleType === "monthly" ? (
            <MonthlyScheduleSelector
              existingSchedules={schedules}
              onMonthSelect={onMonthlyMonthSelect}
              onDateSelectionChange={onDateSelectionChange}
              selectedYear={monthlyYear}
              selectedMonth={monthlyMonth}
              selectedDaysOfWeek={monthlyDaysOfWeek}
              dayColors={dayColors}
              settings={settings}
              mode={mode}
              originalData={originalData}
              scheduleId={scheduleId}
            />
          ) : (
            <CustomCalendar
              key={`calendar-${scheduleType}-${JSON.stringify(
                selectedDays,
              )}-${JSON.stringify(
                weekDates.map((d) => d.toISOString().slice(0, 10)),
              )}`}
              selectedDates={selectedDates}
              schedules={schedules}
              settings={settings}
              onDateSelect={handleDateSelect}
              onMonthChange={handleActiveStartDateChange}
              onDateHover={handleDateHover}
              mode={mode}
              scheduleType={scheduleType}
              originalDates={originalData?.selectedDates || []}
              weekDates={weekDates}
              displayedMonth={displayedMonth}
              displayedYear={displayedYear}
              calendarRef={calendarRef}
              className="w-full"
              showTooltips={true}
              ariaLabel="Schedule Date Selection Calendar"
            />
          )}

          {/* Color Legend - below calendar on left side */}
          {scheduleType !== "monthly" && (
            <ColorLegend dayColors={dayColors} className="mt-4" />
          )}

          {/* Weekly Day Buttons - below calendar, above Day Colors legend on left side */}
          {scheduleType === "weekly" && weekDates.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">
                  Select Days of Week:
                </h3>
                <span className="text-xs text-blue-600">Click to toggle</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                  const dayDate = weekDates.find((d) => d.getDay() === day);
                  const now = scheduleUtils.startOfDay(new Date());
                  const isPast =
                    !dayDate || scheduleUtils.startOfDay(dayDate) < now;

                  // Check if today is blocked by buffer
                  const isToday = dayDate && scheduleUtils.startOfDay(dayDate).getTime() === now.getTime();
                  const isBlockedByBuffer = isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration;
                  
                  let bufferBlocked = false;
                  if (isBlockedByBuffer) {
                    const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
                    bufferBlocked = !bufferInfo.isTodayBookable;
                  }

                  // Check for existing schedules using loadedMonths (like stepper logic)
                  const hasSchedule =
                    dayDate &&
                    (() => {
                      // In edit mode, exclude current batch from conflict checking
                      if (
                        mode === "edit" &&
                        originalData &&
                        originalData.batchId
                      ) {
                        // Check if this date is part of the current batch being edited
                        const isCurrentBatchDate =
                          originalData.selectedDates.some((originalDate) => {
                            const originalDateStr = new Date(originalDate)
                              .toISOString()
                              .slice(0, 10);
                            const currentDateStr = dayDate
                              .toISOString()
                              .slice(0, 10);
                            return originalDateStr === currentDateStr;
                          });

                        if (isCurrentBatchDate) {
                          // This date is part of the current batch, so no conflict
                          return false;
                        }
                      }

                      // Check for conflicts with other schedules
                      const monthStr = `${dayDate.getFullYear()}-${String(
                        dayDate.getMonth() + 1,
                      ).padStart(2, "0")}`;
                      const monthSchedules = loadedMonths[monthStr] || [];
                      return monthSchedules.some((sched) => {
                        const schedStart = new Date(sched.start_time);
                        const schedEnd = new Date(sched.end_time);
                        return (
                          scheduleUtils.startOfDay(dayDate) >=
                            scheduleUtils.startOfDay(schedStart) &&
                          scheduleUtils.startOfDay(dayDate) <=
                            scheduleUtils.startOfDay(schedEnd)
                        );
                      });
                    })();

                  const disabled = isPast || hasSchedule || bufferBlocked;
                  const dayColorMap = colorUtils.getDayColors(dayColors);
                  const dayColor = dayColorMap[day] || "#6B7280"; // Default gray

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        !disabled && onDayToggle && onDayToggle(day)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 ${
                        disabled
                          ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                          : selectedDays.includes(day)
                            ? "text-white border-transparent"
                            : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                      }`}
                      style={
                        selectedDays.includes(day)
                          ? { backgroundColor: dayColor }
                          : {}
                      }
                      aria-pressed={selectedDays.includes(day)}
                      aria-label={
                        [
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ][day === 0 ? 6 : day - 1]
                      }
                      disabled={disabled}
                      title={
                        isPast
                          ? "Cannot select past days"
                          : hasSchedule
                            ? "Day has an existing schedule"
                            : bufferBlocked
                            ? "Today is blocked by time buffer"
                            : ""
                      }
                    >
                      {
                        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                          day === 0 ? 6 : day - 1
                        ]
                      }
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Dates - below Day Colors legend on left side */}
          {scheduleType !== "monthly" && selectedDates.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected Dates:
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date, idx) => {
                  // Ensure date is a Date object
                  const dateObj = date instanceof Date ? date : new Date(date);
                  const dayOfWeek = dateObj.getDay();
                  const dayColor =
                    colorUtils.getDayColors(dayColors)[dayOfWeek];
                  const hasConflict = visibleSchedules.some((sched) => {
                    const schedStart = new Date(sched.start_time);
                    const schedEnd = new Date(sched.end_time);
                    return (
                      scheduleUtils.startOfDay(dateObj) >=
                        scheduleUtils.startOfDay(schedStart) &&
                      scheduleUtils.startOfDay(dateObj) <=
                        scheduleUtils.startOfDay(schedEnd)
                    );
                  });

                  return (
                    <div
                      key={dateObj.toISOString()}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor:
                          colorUtils.hexToStyle(dayColor).backgroundColor,
                        color: "white",
                        borderColor: dayColor,
                      }}
                      title={hasConflict ? `⚠️ Has existing schedule` : ""}
                    >
                      {hasConflict && <span>⚠️</span>}
                      {scheduleUtils.formatDate(dateObj)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Information Panel */}
        <div className="flex-1 space-y-6">
          {/* Schedule Summary */}
          {visibleSchedules.length > 0 && (
            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Schedule Summary (
                {new Date(displayedYear, displayedMonth).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" },
                )}
                ):
              </h3>
              <div className="space-y-3">
                {/* Days with Schedules */}
                {(() => {
                  const displayedMonthSchedules = visibleSchedules.filter(
                    (schedule) => {
                      const scheduleDate = new Date(schedule.start_time);
                      return (
                        scheduleDate.getMonth() === displayedMonth &&
                        scheduleDate.getFullYear() === displayedYear
                      );
                    },
                  );

                  // Count unique days with schedules
                  const daysWithSchedules = new Set();
                  displayedMonthSchedules.forEach((schedule) => {
                    const scheduleDate = new Date(schedule.start_time);
                    const dateKey = scheduleDate.toISOString().slice(0, 10);
                    daysWithSchedules.add(dateKey);
                  });

                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Days with schedules:
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {daysWithSchedules.size}
                      </span>
                    </div>
                  );
                })()}

                {/* Weekend Schedules */}
                {(() => {
                  const weekendSchedules = visibleSchedules.filter(
                    (schedule) => {
                      const scheduleDate = new Date(schedule.start_time);
                      const dayOfWeek = scheduleDate.getDay();
                      return (
                        scheduleDate.getMonth() === displayedMonth &&
                        scheduleDate.getFullYear() === displayedYear &&
                        (dayOfWeek === 0 || dayOfWeek === 6)
                      ); // Sunday or Saturday
                    },
                  );

                  // Count unique weekend days with schedules
                  const weekendDaysWithSchedules = new Set();
                  weekendSchedules.forEach((schedule) => {
                    const scheduleDate = new Date(schedule.start_time);
                    const dateKey = scheduleDate.toISOString().slice(0, 10);
                    weekendDaysWithSchedules.add(dateKey);
                  });

                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Weekend schedules:
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {weekendDaysWithSchedules.size}
                      </span>
                    </div>
                  );
                })()}

                {/* Weekday Schedules */}
                {(() => {
                  const weekdaySchedules = visibleSchedules.filter(
                    (schedule) => {
                      const scheduleDate = new Date(schedule.start_time);
                      const dayOfWeek = scheduleDate.getDay();
                      return (
                        scheduleDate.getMonth() === displayedMonth &&
                        scheduleDate.getFullYear() === displayedYear &&
                        dayOfWeek >= 1 &&
                        dayOfWeek <= 5
                      ); // Monday to Friday
                    },
                  );

                  // Count unique weekday days with schedules
                  const weekdayDaysWithSchedules = new Set();
                  weekdaySchedules.forEach((schedule) => {
                    const scheduleDate = new Date(schedule.start_time);
                    const dateKey = scheduleDate.toISOString().slice(0, 10);
                    weekdayDaysWithSchedules.add(dateKey);
                  });

                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Weekday schedules:
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {weekdayDaysWithSchedules.size}
                      </span>
                    </div>
                  );
                })()}

                {/* Free Days */}
                {(() => {
                  const today = new Date();
                  const daysInMonth = new Date(
                    displayedYear,
                    displayedMonth + 1,
                    0,
                  ).getDate();
                  const currentDay = today.getDate();

                  // Only count future days if we're in the current month
                  const isCurrentMonth =
                    displayedMonth === today.getMonth() &&
                    displayedYear === today.getFullYear();
                  const startDay = isCurrentMonth ? currentDay + 1 : 1; // Start from tomorrow if current month
                  const futureDaysInMonth = daysInMonth - startDay + 1;

                  // Count days with existing schedules in displayed month (from start day onwards)
                  const scheduledDaysInMonth = visibleSchedules.filter(
                    (schedule) => {
                      const scheduleDate = new Date(schedule.start_time);
                      return (
                        scheduleDate.getMonth() === displayedMonth &&
                        scheduleDate.getFullYear() === displayedYear &&
                        scheduleDate.getDate() >= startDay
                      );
                    },
                  ).length;

                  const freeDaysInMonth = Math.max(
                    0,
                    futureDaysInMonth - scheduledDaysInMonth,
                  );

                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Free days:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {freeDaysInMonth}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Tooltip - below schedule summary */}
          {tooltipVisible && (
            <ScheduleTooltip
              visible={tooltipVisible}
              content={tooltipContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StepDateSelector;

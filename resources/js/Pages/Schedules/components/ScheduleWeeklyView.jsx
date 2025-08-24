import React, { useState, useMemo, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  isPast,
} from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { colorUtils } from "@/Pages/Schedules/utils";
import MonthSelector from "./MonthSelector";
import WeekSelector from "./WeekSelector";
import ScheduleLegend from "./ScheduleLegend";
import DayHeader from "./DayHeader";

const ScheduleWeeklyView = ({
  schedules = [],
  onEdit,
  onDelete,
  onWeekSelect,
  currentWeek = new Date(),
  loading = false,
  dayColors = {},
  selectedMonth = new Date(),
  onMonthChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Week data calculation
  const weekData = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  // Group schedules by date and time
  const schedulesByDateAndTime = useMemo(() => {
    const grouped = {};

    schedules.forEach((schedule) => {
      // Convert UTC to local time for display
      const scheduleDate = new Date(schedule.start_time);
      const localDate = startOfDay(scheduleDate);
      const dateKey = format(localDate, "yyyy-MM-dd");
      const timeKey = format(scheduleDate, "HH:mm");

      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      if (!grouped[dateKey][timeKey]) {
        grouped[dateKey][timeKey] = [];
      }

      // Determine schedule type from batch_id prefix
      let scheduleType = "single";
      if (schedule.batch_id) {
        if (schedule.batch_id.startsWith("w_")) {
          scheduleType = "weekly";
        } else if (schedule.batch_id.startsWith("m_")) {
          scheduleType = "monthly";
        }
      }

      grouped[dateKey][timeKey].push({
        ...schedule,
        scheduleType,
        displayTime: format(scheduleDate, "h:mm a"), // Use local time
        displayDate: format(localDate, "MMM d"),
        isPast: isPast(scheduleDate), // Check if schedule is in the past
      });
    });

    return grouped;
  }, [schedules]);

  // Event handlers
  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleEventClick = useCallback(
    (event, e) => {
      e.stopPropagation();
      onEdit?.(event);
    },
    [onEdit],
  );

  const handleEventDelete = useCallback(
    (event, e) => {
      e.stopPropagation();
      onDelete?.(event);
    },
    [onDelete],
  );

  // Render individual event
  const renderEvent = useCallback(
    (event, index) => {
      const colors = colorUtils.getScheduleTypeColors(event.scheduleType);
      const indicator = colorUtils.getScheduleTypeIndicator(event.scheduleType);

      return (
        <div
          key={`${event.id}-${index}`}
          className={`mb-1 p-2 rounded text-xs transition-all duration-200 ${
            event.isPast
              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
              : "bg-white border border-gray-200 hover:shadow-md cursor-pointer"
          }`}
          onClick={(e) => !event.isPast && handleEventClick(event, e)}
          role="button"
          tabIndex={event.isPast ? -1 : 0}
          aria-label={`${event.scheduleType} schedule at ${event.displayTime}${
            event.isPast ? " (Past - cannot edit)" : ""
          }`}
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span
                className="text-lg font-bold flex-shrink-0"
                style={{ color: colors.primary }}
                aria-label={`${event.scheduleType} schedule indicator`}
              >
                {indicator}
              </span>
              <span className="font-medium text-gray-900 truncate min-w-0">
                {event.displayTime}
              </span>
            </div>
            {!event.isPast && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event, e);
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  aria-label="Edit schedule"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventDelete(event, e);
                  }}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  aria-label="Delete schedule"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    },
    [handleEventClick, handleEventDelete],
  );

  // Generate time slots from 6 AM to 10 PM in 30-minute intervals
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with month selector and week selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
          <WeekSelector
            selectedMonth={selectedMonth}
            selectedWeek={currentWeek}
            onWeekSelect={onWeekSelect}
          />
        </div>
      </div>

      {/* Week range display */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(weekData[0], "MMM d")} - {format(weekData[6], "MMM d, yyyy")}
        </h3>
      </div>

      {/* Weekly grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Time column and day headers */}
          <div className="grid grid-cols-8 gap-1 border-b border-gray-200">
            {/* Time column header */}
            <div className="p-2 bg-gray-50 border-r border-gray-200">
              <div className="text-sm font-medium text-gray-500">Time</div>
            </div>

            {/* Day headers */}
            {weekData.map((date) => {
              const isToday = isSameDay(date, new Date());
              const isPastDate = isPast(date);
              const dayColor = dayColors[date.getDay()] || "#6b7280";

              return (
                <DayHeader
                  key={date.toISOString()}
                  date={date}
                  dayColor={dayColor}
                  isToday={isToday}
                  isPastDate={isPastDate}
                />
              );
            })}
          </div>

          {/* Time slots */}
          <div className="overflow-y-auto max-h-[600px] overflow-x-hidden">
            {timeSlots.map((timeSlot) => (
              <div
                key={timeSlot}
                className="grid grid-cols-8 gap-1 border-b border-gray-100"
              >
                {/* Time label */}
                <div className="p-2 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 font-medium">
                  {timeSlot}
                </div>

                {/* Day columns */}
                {weekData.map((date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const timeKey = timeSlot;
                  const daySchedules =
                    schedulesByDateAndTime[dateKey]?.[timeKey] || [];
                  const isPastDate = isPast(date);

                  return (
                    <div
                      key={`${dateKey}-${timeKey}`}
                      className={`p-1 min-h-[60px] border-r border-gray-100 ${
                        isPastDate ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      {daySchedules.length > 0
                        ? daySchedules.map((event, index) =>
                            renderEvent(event, index),
                          )
                        : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleWeeklyView;

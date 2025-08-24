import React, { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfDay,
  isPast,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react';
import { colorUtils } from '@/Pages/Schedules/utils';
import ScheduleLegend from './ScheduleLegend';

const ScheduleCalendar = ({
  schedules = [],
  onEdit,
  onDelete,
  onMonthChange,
  currentMonth = new Date(),
  loading = false,
  dayColors = {}, // Add day colors prop
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Navigation handlers
  const handlePreviousMonth = useCallback(() => {
    const newMonth = subMonths(currentMonth, 1);
    onMonthChange?.(newMonth);
  }, [currentMonth, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    const newMonth = addMonths(currentMonth, 1);
    onMonthChange?.(newMonth);
  }, [currentMonth, onMonthChange]);

  const handleToday = useCallback(() => {
    const today = new Date();
    onMonthChange?.(today);
  }, [onMonthChange]);

  // Calendar data calculation
  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Get first day of week for padding - use Monday as start of week
    const firstDayOfWeek = start.getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Monday start
    const mondayStartOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const paddingDays = Array.from(
      { length: mondayStartOffset },
      (_, i) => null
    );

    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped = {};

    schedules.forEach(schedule => {
      // Convert UTC to local time for display
      const scheduleDate = new Date(schedule.start_time);
      const localDate = startOfDay(scheduleDate);
      const dateKey = format(localDate, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      // Determine schedule type from batch_id prefix
      let scheduleType = 'single';
      if (schedule.batch_id) {
        if (schedule.batch_id.startsWith('w_')) {
          scheduleType = 'weekly';
        } else if (schedule.batch_id.startsWith('m_')) {
          scheduleType = 'monthly';
        }
      }

      grouped[dateKey].push({
        ...schedule,
        scheduleType,
        displayTime: format(scheduleDate, 'h:mm a'), // Use local time
        displayDate: format(localDate, 'MMM d'),
        isPast: isPast(scheduleDate), // Check if schedule is in the past
      });
    });

    return grouped;
  }, [schedules]);

  // Render individual event
  const renderEvent = useCallback(
    (event, index) => {
      const colors = colorUtils.getScheduleTypeColors(event.scheduleType);
      const indicator = colorUtils.getScheduleTypeIndicator(event.scheduleType);

      return (
        <div
          key={`${event.id}-${index}`}
          className={`mb-0.5 px-2 rounded text-xs transition-all duration-200 ${
            event.isPast
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
              : 'text-white cursor-pointer'
          }`}
          style={{
            backgroundColor: event.isPast ? undefined : colors.primary,
          }}
          onMouseEnter={() => {
            setHoveredEvent(event.id);
          }}
          onMouseLeave={() => {
            setHoveredEvent(null);
          }}
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span
                className="text-lg font-bold flex-shrink-0 text-white"
                aria-label={`${event.scheduleType} schedule indicator`}
              >
                {indicator}
              </span>
              <span className="font-medium text-white truncate min-w-0">
                {event.displayTime}
              </span>
            </div>
            {!event.isPast && hoveredEvent === event.id && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEdit?.(event);
                  }}
                  className="p-1 text-white hover:text-white hover:bg-black hover:bg-opacity-20 rounded transition-colors"
                  aria-label="Edit schedule"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete?.(event);
                  }}
                  className="p-1 text-white hover:text-white hover:bg-black hover:bg-opacity-20 rounded transition-colors"
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
    [hoveredEvent, onEdit, onDelete]
  );

  // Render individual day
  const renderDay = useCallback(
    (day, index) => {
      if (!day) {
        return (
          <div
            key={`empty-${index}`}
            className="min-h-[120px] bg-gray-50 border border-gray-200"
          />
        );
      }

      const isToday = isSameDay(day, new Date());
      const isPastDate = isPast(day);
      const dayColor = dayColors[day.getDay()] || '#6b7280';
      const dateKey = format(day, 'yyyy-MM-dd');
      const daySchedules = schedulesByDate[dateKey] || [];

      return (
        <div
          key={day.toISOString()}
          className={`min-h-[100px] border border-gray-200 ${
            isPastDate ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          {/* Day header */}
          <div className="p-1 text-center">
            <div
              className={`text-sm font-medium ${
                isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>

          {/* Events container */}
          <div className="px-1 space-y-0.5 max-h-16 overflow-y-auto overflow-x-hidden">
            {daySchedules.length > 0 ? (
              daySchedules.map((event, eventIndex) =>
                renderEvent(event, eventIndex)
              )
            ) : (
              <div className="text-gray-400 text-xs text-center py-2">
                No schedules
              </div>
            )}
          </div>
        </div>
      );
    },
    [schedulesByDate, dayColors, renderEvent]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleToday}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
            (day, index) => {
              // Map day labels to day indices (Monday=1, Tuesday=2, etc., Sunday=0)
              // Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6, Sunday=0
              const dayIndex = index === 6 ? 0 : index + 1;
              const dayColor = dayColors[dayIndex] || '#6b7280';

              return (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-semibold text-white rounded-t-lg shadow-md border-b-2 border-white border-opacity-20 hover:shadow-lg transition-all duration-200"
                  style={{
                    backgroundColor: dayColor,
                  }}
                >
                  {day}
                </div>
              );
            }
          )}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => renderDay(day, index))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;

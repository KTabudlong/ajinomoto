import React from "react";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthSelector = ({ selectedMonth, onMonthChange, className = "" }) => {
  const handlePreviousMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = isSameMonth(selectedMonth, new Date());

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <button
        onClick={handlePreviousMonth}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="text-lg font-semibold text-gray-900 min-w-[120px] text-center">
        {format(selectedMonth, "MMMM yyyy")}
      </div>

      <button
        onClick={handleNextMonth}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        onClick={handleToday}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isCurrentMonth
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Today
      </button>
    </div>
  );
};

export default MonthSelector;

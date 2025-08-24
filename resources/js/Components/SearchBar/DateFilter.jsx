import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Calendar, X } from "lucide-react";

const DateFilter = ({
  routeName,
  additionalFilters = {},
  placeholder = "Filter by date...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  // Generate year options (current year + 5 years back and forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Generate month options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return { value: day.toString().padStart(2, "0"), label: day.toString() };
  });

  // Initialize from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSelectedYear(urlParams.get("year") || "");
    setSelectedMonth(urlParams.get("month") || "");
    setSelectedDay(urlParams.get("day") || "");
  }, []);

  const handleFilter = () => {
    const filters = {
      ...additionalFilters,
      year: selectedYear || undefined,
      month: selectedMonth || undefined,
      day: selectedDay || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    router.get(route(routeName), filters, {
      preserveState: true,
      replace: true,
    });

    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");

    const filters = { ...additionalFilters };
    delete filters.year;
    delete filters.month;
    delete filters.day;

    router.get(route(routeName), filters, {
      preserveState: true,
      replace: true,
    });

    setIsOpen(false);
  };

  const hasActiveFilters = selectedYear || selectedMonth || selectedDay;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Calendar size={16} />
        <span className="text-sm">
          {hasActiveFilters
            ? `${selectedMonth ? months.find((m) => m.value === selectedMonth)?.label : ""} ${selectedDay || ""} ${selectedYear || ""}`.trim()
            : placeholder}
        </span>
        {hasActiveFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-1 p-0.5 hover:bg-blue-100 rounded"
          >
            <X size={12} />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Days</option>
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleFilter}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filter
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default DateFilter;

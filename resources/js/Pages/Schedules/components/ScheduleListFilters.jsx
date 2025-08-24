import React, { useState, useEffect, useMemo } from "react";
import { router } from "@inertiajs/react";

const ScheduleListFilters = ({
  currentFilters = {},
  onFiltersChange,
  routeName = "admin.schedules",
}) => {
  // Get current local date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  
  const [filters, setFilters] = useState({
    year: currentFilters.year || currentYear.toString(),
    month: currentFilters.month || currentMonth,
    day: currentFilters.day || "",
    batch_id: currentFilters.batch_id || "",
  });

  // Generate year options (current year + 5 years back and forward)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Generate month options
  const months = [
    { value: "", label: "All Months" },
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



  // Generate dynamic day options based on selected month and year
  const days = useMemo(() => {
    if (!filters.month || !filters.year || filters.month === "" || filters.year === "") {
      return [];
    }
    
    const year = parseInt(filters.year);
    const month = parseInt(filters.month) - 1;
    
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) return [];
    
    const lastDay = new Date(year, month + 1, 0).getDate();
    if (isNaN(lastDay) || lastDay < 1) return [];
    
    return Array.from({ length: lastDay }, (_, i) => {
      const day = i + 1;
      return { 
        value: day.toString().padStart(2, "0"), 
        label: day.toString().padStart(2, "0") 
      };
    });
  }, [filters.month, filters.year]);

  // Initialize from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setFilters({
      year: urlParams.get("year") || currentYear.toString(),
      month: urlParams.get("month") || currentMonth,
      day: urlParams.get("day") || "",
      batch_id: urlParams.get("batch_id") || "",
    });
  }, [currentYear, currentMonth]);

  // Update day when month/year changes to ensure valid day selection
  useEffect(() => {
    if (filters.month && filters.year) {
      const year = parseInt(filters.year);
      const month = parseInt(filters.month) - 1;
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) return;
      
      const lastDay = new Date(year, month + 1, 0).getDate();
      if (isNaN(lastDay) || lastDay < 1) return;
      
      const currentDay = parseInt(filters.day);
      if (currentDay > lastDay) {
        setFilters(prev => ({ ...prev, day: "" }));
      }
    }
  }, [filters.month, filters.year, filters.day]);

  const handleFilterChange = (key, value) => {
    let newFilters = { ...filters, [key]: value };
    
    // Special handling for month/year changes - reset day to "All Days"
    if (key === 'month' || key === 'year') {
      newFilters.day = "";
    }
    
    setFilters(newFilters);
    
    // Apply filters automatically when changed
    const cleanFilters = { ...newFilters };
    
    // Keep empty values for "All" selections, only remove undefined
    Object.keys(cleanFilters).forEach((key) => {
      if (cleanFilters[key] === undefined) {
        delete cleanFilters[key];
      }
    });

    // Simple approach: let Inertia.js handle the URL naturally
    router.get(route(routeName), cleanFilters, {
      preserveState: true,
      preserveScroll: true,
    });

    onFiltersChange?.(cleanFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      year: currentYear.toString(),
      month: currentMonth,
      day: "",
      batch_id: "",
    };

    setFilters(defaultFilters);

    // Send empty strings to indicate "show all" for each filter
    // This will trigger the backend to show all data for current year/month
    router.get(route(routeName), defaultFilters, {
      preserveState: true,
      preserveScroll: true,
    });

    onFiltersChange?.(defaultFilters);
  };

  return (
    <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-4">
        {/* Year Filter */}
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-700 mb-1">Year</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-700 mb-1">Month</label>
          <select
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-700 mb-1">Date</label>
          <select
            value={filters.day}
            onChange={(e) => handleFilterChange("day", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            disabled={!filters.month || !filters.year}
          >
            <option value="">All Days</option>
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Batch ID Filter */}
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-700 mb-1">Batch ID</label>
          <input
            type="text"
            value={filters.batch_id}
            onChange={(e) => handleFilterChange("batch_id", e.target.value)}
            placeholder="Search batch ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
        </div>

        {/* Clear All Button */}
        <div className="flex flex-col justify-end flex-shrink-0">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleListFilters;

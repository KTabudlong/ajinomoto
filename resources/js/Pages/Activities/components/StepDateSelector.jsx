import React, { useState, useEffect } from "react";

const StepDateSelector = ({
  activityType,
  startDate,
  endDate,
  frequencyConfig,
  onStartDateChange,
  onEndDateChange,
  onFrequencyConfigChange,
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Generate years (current year + 10 years)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);
  
  // Generate months
  const months = [
    { value: 0, name: "January" },
    { value: 1, name: "February" },
    { value: 2, name: "March" },
    { value: 3, name: "April" },
    { value: 4, name: "May" },
    { value: 5, name: "June" },
    { value: 6, name: "July" },
    { value: 7, name: "August" },
    { value: 8, name: "September" },
    { value: 9, name: "October" },
    { value: 10, name: "November" },
    { value: 11, name: "December" },
  ];

  // Generate days based on selected month and year
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  // Update start date when year/month/day changes
  useEffect(() => {
    if (selectedYear && selectedMonth !== null && selectedDay) {
      const newStartDate = new Date(selectedYear, selectedMonth, selectedDay);
      onStartDateChange(newStartDate);
    }
  }, [selectedYear, selectedMonth, selectedDay, onStartDateChange]);

  // Handle frequency config changes
  const handleFrequencyConfigChange = (key, value) => {
    onFrequencyConfigChange({
      ...frequencyConfig,
      [key]: value,
    });
  };

  // Render different date inputs based on activity type
  const renderDateInputs = () => {
    switch (activityType) {
      case "single":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Date
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case "quarterly_start":
      case "quarterly_end":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Year (Optional)
              </label>
              <select
                value={endDate ? endDate.getFullYear() : ""}
                onChange={(e) => {
                  const year = e.target.value ? parseInt(e.target.value) : null;
                  if (year) {
                    onEndDateChange(new Date(year, 11, 31)); // End of year
                  } else {
                    onEndDateChange(null);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No end date (ongoing)</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case "every_x_months":
      case "every_x_years":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval
              </label>
              <input
                type="number"
                min="1"
                max={activityType === "every_x_months" ? "12" : "10"}
                value={frequencyConfig.interval || ""}
                onChange={(e) => handleFrequencyConfigChange("interval", parseInt(e.target.value))}
                placeholder={activityType === "every_x_months" ? "Every X months" : "Every X years"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Year (Optional)
                </label>
                <select
                  value={endDate ? endDate.getFullYear() : ""}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : null;
                    if (year) {
                      onEndDateChange(new Date(year, 11, 31));
                    } else {
                      onEndDateChange(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No end date (ongoing)</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case "specific_dates":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Dates (comma-separated)
              </label>
              <textarea
                value={frequencyConfig.specificDates || ""}
                onChange={(e) => handleFrequencyConfigChange("specificDates", e.target.value)}
                placeholder="e.g., 01-15, 03-20, 06-10, 09-25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: MM-DD (month-day), one per line or comma-separated
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={endDate ? endDate.getFullYear() : ""}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : null;
                    if (year) {
                      onEndDateChange(new Date(year, 11, 31));
                    } else {
                      onEndDateChange(null);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No end date (ongoing)</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case "annually_custom":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Date
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={endDate ? endDate.getFullYear() : ""}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : null;
                    if (year) {
                      onEndDateChange(new Date(year, 11, 31));
                    } else {
                      onEndDateChange(null);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No end date (ongoing)</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case "monthly":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Date
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={endDate ? endDate.getFullYear() : ""}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : null;
                    if (year) {
                      onEndDateChange(new Date(year, 11, 31));
                    } else {
                      onEndDateChange(null);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No end date (ongoing)</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case "every_x_days":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Every X Days
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={frequencyConfig.interval || ""}
                onChange={(e) => handleFrequencyConfigChange("interval", parseInt(e.target.value))}
                placeholder="e.g., 7 for weekly, 14 for bi-weekly"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Year (Optional)
                </label>
                <select
                  value={endDate ? endDate.getFullYear() : ""}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : null;
                    if (year) {
                      onEndDateChange(new Date(year, 11, 31));
                    } else {
                      onEndDateChange(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No end date (ongoing)</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Please select an activity type in the previous step.
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select Dates
        </h2>
        <p className="text-gray-600">
          Configure the dates for your activity based on the selected type.
        </p>
      </div>

      {renderDateInputs()}

      {startDate && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                <strong>Start Date:</strong> {startDate.toLocaleDateString()}
              </p>
              {endDate && (
                <p className="text-sm text-green-700 mt-1">
                  <strong>End Date:</strong> {endDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepDateSelector;

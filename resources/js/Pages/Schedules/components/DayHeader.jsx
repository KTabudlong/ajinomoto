import React from "react";
import { format, isToday, isPast } from "date-fns";

const DayHeader = ({
  date,
  dayColor,
  className = "",
  showDate = true,
  showDayName = true,
}) => {
  const isPastDate = isPast(date);
  const isTodayDate = isToday(date);

  return (
    <div
      className={`p-2 text-center ${className}`}
      style={{ backgroundColor: dayColor }}
    >
      {showDayName && (
        <div className="text-white font-medium text-sm">
          {format(date, "EEE")}
        </div>
      )}
      {showDate && (
        <div
          className={`text-lg font-bold ${
            isTodayDate ? "text-yellow-300" : "text-white"
          }`}
        >
          {format(date, "d")}
        </div>
      )}
    </div>
  );
};

export default DayHeader;

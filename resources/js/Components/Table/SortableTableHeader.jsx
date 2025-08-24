import React from "react";

const SortableTableHeader = ({
  column,
  label,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = "",
  sortable = true,
}) => {
  // Check if this column is sortable (exclude actions and other non-sortable columns)
  const isSortable = sortable !== false && column && column !== "actions";
  const isActive = isSortable && currentSortBy === column;
  const nextSortOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";

  const handleClick = () => {
    if (isSortable && onSort) {
      onSort(column, nextSortOrder);
    }
  };

  const getSortIcon = () => {
    if (!isSortable) {
      return null; // No icon for non-sortable columns
    }

    if (!isActive) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    if (currentSortOrder === "asc") {
      return (
        <svg
          className="w-4 h-4 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isSortable ? "cursor-pointer hover:bg-gray-100" : ""} ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {isSortable && <span className="ml-2">{getSortIcon()}</span>}
      </div>
    </th>
  );
};

export default SortableTableHeader;

import React from "react";

/**
 * TableHeader Component - Single Responsibility: Renders table header
 * Interface Segregation: Only handles header-specific props
 */
export default function TableHeader({ columns = [] }) {
  return (
    <thead>
      <tr className="font-bold text-left">
        {columns?.map((column) => (
          <th
            key={column.label}
            colSpan={column.colSpan ?? 1}
            className="px-6 pt-5 pb-4"
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

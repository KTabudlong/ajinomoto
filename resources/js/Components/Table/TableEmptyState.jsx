import React from "react";

/**
 * TableEmptyState Component - Single Responsibility: Renders empty state
 * Single Responsibility: Only handles empty state display
 */
export default function TableEmptyState({
  columns = [],
  message = "No data found.",
}) {
  return (
    <tr>
      <td className="px-6 py-24 border-t text-center" colSpan={columns.length}>
        {message}
      </td>
    </tr>
  );
}

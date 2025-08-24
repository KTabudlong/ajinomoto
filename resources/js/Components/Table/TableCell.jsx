import React from "react";
import { Link } from "@inertiajs/react";
import get from "lodash/get";
import { useInteractiveElementDetector } from "./hooks/useInteractiveElementDetector";

/**
 * TableCell Component - Single Responsibility: Renders individual table cells
 * Single Responsibility: Handles cell content and link wrapping logic
 */
export default function TableCell({ column, row, getRowDetailsUrl }) {
  const cellContent =
    column.renderCell?.(row) ?? get(row, column.name) ?? "N/A";
  const hasInteractiveElements = useInteractiveElementDetector(cellContent);

  return (
    <td className="border-t">
      {hasInteractiveElements ? (
        <div className="flex items-center px-6 py-4">{cellContent}</div>
      ) : getRowDetailsUrl?.(row) ? (
        <Link
          tabIndex={-1}
          href={getRowDetailsUrl(row)}
          className="flex items-center px-6 py-4 focus:text-indigo focus:outline-none"
        >
          {cellContent}
        </Link>
      ) : (
        <div className="flex items-center px-6 py-4">{cellContent}</div>
      )}
    </td>
  );
}

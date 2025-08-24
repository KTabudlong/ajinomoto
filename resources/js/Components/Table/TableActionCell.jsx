import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";

/**
 * TableActionCell Component - Single Responsibility: Renders action column
 * Interface Segregation: Only handles action-specific rendering
 */
export default function TableActionCell({ row, getRowDetailsUrl }) {
  return (
    <td className="w-px border-t">
      <Link
        href={getRowDetailsUrl?.(row)}
        className="flex items-center px-4 focus:outline-none"
      >
        <ChevronRight size={24} className="text-gray-400" />
      </Link>
    </td>
  );
}

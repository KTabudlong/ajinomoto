import { Link } from "@inertiajs/react";
import classNames from "classnames";

export default function Pagination({ links = [] }) {
  /**
   * Handle both array and object pagination links gracefully
   */
  let processedLinks = links;
  if (!Array.isArray(links) && typeof links === "object" && links !== null) {
    // Convert object to array for first/prev/next/last
    processedLinks = [];
    if (links.first)
      processedLinks.push({ url: links.first, label: "First", active: false });
    if (links.prev)
      processedLinks.push({
        url: links.prev,
        label: "Previous",
        active: false,
      });
    if (links.next)
      processedLinks.push({ url: links.next, label: "Next", active: false });
    if (links.last)
      processedLinks.push({ url: links.last, label: "Last", active: false });
  }
  if (!Array.isArray(processedLinks)) {
    return null;
  }
  if (processedLinks.length === 0 || processedLinks.length === 3) return null;
  return (
    <div className="flex flex-wrap mt-6 -mb-1">
      {processedLinks.map((link) => {
        return link?.url === null ? (
          <PageInactive key={link.label} label={link.label} />
        ) : (
          <PaginationItem key={link.label} {...link} />
        );
      })}
    </div>
  );
}

function PaginationItem({ active, label, url }) {
  const className = classNames(
    [
      "mr-1 mb-1",
      "px-4 py-3",
      "border border-solid rounded",
      "text-sm",
      "focus:outline-none",
    ],
    {
      // Active page styling with theme colors
      "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 focus:border-indigo-700":
        active,
      // Inactive page styling
      "border-gray-300 text-gray-700 hover:bg-gray-50 focus:border-indigo-700 focus:text-indigo-700":
        !active,
    },
  );

  /**
   * Note: In general you should be aware when using `dangerouslySetInnerHTML`.
   *
   * In this case, `label` from the API is a string, so it's safe to use it.
   * It will be either `&laquo; Previous` or `Next &raquo;`
   */
  return (
    <Link className={className} href={url}>
      <span dangerouslySetInnerHTML={{ __html: label }}></span>
    </Link>
  );
}

function PageInactive({ label }) {
  const className = classNames(
    "mr-1 mb-1 px-4 py-3 text-sm border rounded border-solid border-gray-300 text-gray",
  );

  /**
   * Note: In general you should be aware when using `dangerouslySetInnerHTML`.
   *
   * In this case, `label` from the API is a string, so it's safe to use it.
   * It will be either `&laquo; Previous` or `Next &raquo;`
   */
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: label }} />
  );
}

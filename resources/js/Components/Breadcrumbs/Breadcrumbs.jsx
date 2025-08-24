import React from "react";
import { Link } from "@inertiajs/react";

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="w-full mb-8" aria-label="Breadcrumb">
      <div className="flex flex-wrap items-center">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 md:mx-3 font-medium text-indigo-600">
                /
              </span>
            )}
            {index === items.length - 1 ? (
              // Last item (current page) - not clickable
              <span className="text-sm md:text-base font-medium text-gray-900 truncate">
                {item.label}
              </span>
            ) : (
              // Clickable breadcrumb items
              <Link
                href={item.href}
                className="text-sm md:text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200 truncate"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;

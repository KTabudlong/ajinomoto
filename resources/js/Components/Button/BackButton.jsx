import { Link } from "@inertiajs/react";

/**
 * Reusable BackButton component following SOLID principles
 *
 * Single Responsibility: Only handles back navigation
 * Open/Closed: Extensible through props without modification
 * Liskov Substitution: Can be used anywhere a button is expected
 * Interface Segregation: Accepts only necessary props
 * Dependency Inversion: Depends on abstractions (Link)
 */
const BackButton = ({ href, children = "Back", className = "", ...props }) => {
  return (
    <Link href={href} className="flex items-center" {...props}>
      <button
        type="button"
        className={`px-6 py-3 rounded border border-gray-300 bg-white text-gray-700 text-sm font-bold whitespace-nowrap hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-100 transition duration-150 ease-in-out ${className}`}
      >
        {children}
      </button>
    </Link>
  );
};

export default BackButton;

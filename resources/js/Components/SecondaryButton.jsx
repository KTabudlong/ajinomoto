export default function SecondaryButton({
  type = "button",
  className = "",
  disabled,
  children,
  variant = "gray", // Default to original gray theme
  ...props
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case "blue":
        return "border-blue-300 bg-white text-blue-700 hover:bg-blue-50 focus:ring-blue-500";
      case "green":
        return "border-green-300 bg-white text-green-700 hover:bg-green-50 focus:ring-green-500";
      case "red":
        return "border-red-300 bg-white text-red-700 hover:bg-red-50 focus:ring-red-500";
      case "yellow":
        return "border-yellow-300 bg-white text-yellow-700 hover:bg-yellow-50 focus:ring-yellow-500";
      case "purple":
        return "border-purple-300 bg-white text-purple-700 hover:bg-purple-50 focus:ring-purple-500";
      case "indigo":
        return "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500";
      case "gray":
      default:
        return "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500";
    }
  };

  return (
    <button
      {...props}
      type={type}
      className={
        `inline-flex items-center rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-widest shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${getVariantClasses()} ${
          disabled && "opacity-25"
        } ` + className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}

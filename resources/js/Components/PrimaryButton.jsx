export default function PrimaryButton({
  className = "",
  disabled,
  children,
  variant = "indigo", // Default to indigo theme
  ...props
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:ring-blue-500";
      case "green":
        return "bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-800 focus:ring-green-500";
      case "red":
        return "bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800 focus:ring-red-500";
      case "yellow":
        return "bg-yellow-600 hover:bg-yellow-700 focus:bg-yellow-700 active:bg-yellow-800 focus:ring-yellow-500";
      case "purple":
        return "bg-purple-600 hover:bg-purple-700 focus:bg-purple-700 active:bg-purple-800 focus:ring-purple-500";
      case "indigo":
      default:
        return "bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500";
    }
  };

  return (
    <button
      {...props}
      className={
        `inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${getVariantClasses()} ${
          disabled && "opacity-25"
        } ` + className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}

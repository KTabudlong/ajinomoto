import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { usePrevious } from "react-use";
import pickBy from "lodash/pickBy";

import TextInput from "@/Components/Form/TextInput";

export default function SearchBar({
  placeholder = "Search...",
  additionalFilters = {},
  routeName = null,
  routeParams = {},
}) {
  const { filters = {} } = usePage().props;

  const [values, setValues] = useState({
    search: filters?.search || "",
    ...additionalFilters,
  });

  const prevValues = usePrevious(values);

  useEffect(() => {
    if (prevValues) {
      const query = Object.keys(pickBy(values)).length ? pickBy(values) : {};

      const targetRoute = routeName || route().current();
      const targetParams = routeParams || {};

      router.get(route(targetRoute, targetParams), query, {
        replace: true,
        preserveState: true,
      });
    }
  }, [values]);

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    setValues((values) => ({
      ...values,
      [name]: value,
    }));
  }

  function handleReset() {
    const resetValues = {
      search: "",
      ...Object.keys(additionalFilters).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {}),
    };
    setValues(resetValues);
  }

  return (
    <div className="flex items-center w-full mr-4">
      <div className="flex-1 relative flex bg-white rounded shadow">
        <TextInput
          name="search"
          placeholder={placeholder}
          autoComplete="off"
          value={values.search}
          onChange={handleChange}
          className="border-0 rounded-l-none focus:ring-2"
        />
      </div>
      <div className="flex items-center ml-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none rounded-md transition-colors"
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

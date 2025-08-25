import { Link, usePage, router } from "@inertiajs/react";
import { Trash2, Pencil } from "lucide-react";

import MainLayout from "@/Layouts/MainLayout";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Pagination from "@/Components/Pagination/Pagination";
import SortableTable from "@/Components/Table/SortableTable";

const Index = () => {
  const { users, filters, auth } = usePage().props;
  const user = auth.user;

  const {
    data,
    meta: { links },
  } = users;

  const handleSort = (columnName, sortOrder) => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("sort_by", columnName);
    currentParams.set("sort_order", sortOrder);

    // Preserve search parameter if it exists
    const searchParam = currentParams.get("search");
    if (searchParam) {
      currentParams.set("search", searchParam);
    }

    // Use Inertia router for SPA navigation
            router.get(route("admin.users"), Object.fromEntries(currentParams), {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { 
            label: user.role_id === 1 ? "Admin Panel" : "Admin", 
            href: user.role_id === 1 ? route("admin.super.dashboard") : route("admin.dashboard") 
          },
          { label: "Users", href: route("admin.users") },
        ]}
      />
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">
        My Students
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <SearchBar placeholder="Search students..." />
        <Link
          className="btn-indigo focus:outline-none w-full sm:w-auto"
          href={route("admin.users.create")}
        >
          <span>Create</span>
          <span className="hidden md:inline"> Student</span>
        </Link>
      </div>
      <SortableTable
        columns={[
          {
            label: "Name",
            name: "name",
            renderCell: (row) => (
              <>
                {row.avatar && (
                  <img
                    src={row.avatar}
                    alt={row.name}
                    className="w-5 h-5 mr-2 rounded-full"
                  />
                )}
                <>{row.name}</>
                {row.deleted_at && (
                  <Trash2 size={16} className="ml-2 text-gray-400" />
                )}
              </>
            ),
          },
          { label: "Email", name: "email" },
          {
            label: "Created",
            name: "created_at",
            renderCell: (row) => new Date(row.created_at).toLocaleDateString(),
          },
          {
            label: "Actions",
            name: "actions",
            renderCell: (row) => (
              <div className="flex gap-2">
                <Link
                  href={route("admin.users.edit", row.id)}
                  className="inline-flex items-center p-2 text-indigo-600 hover:text-indigo-900 transition"
                  title="Edit"
                >
                  <Pencil size={18} />
                </Link>
                {/* Optionally add a delete button here if allowed */}
              </div>
            ),
          },
        ]}
        rows={data}
        // Explicit action buttons only, no row click navigation
        onSort={handleSort}
        currentSortBy={filters?.sort_by || "name"}
        currentSortOrder={filters?.sort_order || "asc"}
      />
      <Pagination links={Array.isArray(links) ? links : []} />
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Index.layout = (page) => <MainLayout title="My Students" children={page} />;

export default Index;

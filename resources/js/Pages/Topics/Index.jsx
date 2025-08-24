import { Link, usePage, router } from "@inertiajs/react";
import { Trash2, Edit, RotateCcw } from "lucide-react";
import { useState } from "react";

import MainLayout from "@/Layouts/MainLayout";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Pagination from "@/Components/Pagination/Pagination";
import SortableTable from "@/Components/Table/SortableTable";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";

const Index = () => {
  const { topics, currentSubject, filters, auth } = usePage().props;
  const user = auth.user;
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    topic: null,
  });
  const [restoreModal, setRestoreModal] = useState({
    isOpen: false,
    topic: null,
  });

  // Handle ResourceCollection nested structure
  const data = topics.data?.data || topics.data || topics;
  const links = topics.data?.links || topics.links || [];

  // Ensure data is an array for the table
  const tableData = Array.isArray(data) ? data : [];

  const handleSort = (columnName, sortOrder) => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("sort_by", columnName);
    currentParams.set("sort_order", sortOrder);

    // Preserve search parameter if it exists
    const searchParam = currentParams.get("search");
    if (searchParam) {
      currentParams.set("search", searchParam);
    }

    const queryParams = Object.fromEntries(currentParams);

    // Use Inertia router for SPA navigation
    router.get(
      route("admin.topics.by-subject", currentSubject.id),
      queryParams,
      {
        replace: true,
        preserveState: true,
      },
    );
  };

  const handleDeleteClick = (topic) => {
    setDeleteModal({ isOpen: true, topic });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.topic) {
      router.delete(
        route("admin.topics.destroy", [
          currentSubject.id,
          deleteModal.topic.id,
        ]),
        {
          onSuccess: () => {
            setDeleteModal({ isOpen: false, topic: null });
          },
        },
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, topic: null });
  };

  const handleRestoreClick = (topic) => {
    setRestoreModal({ isOpen: true, topic });
  };

  const handleRestoreConfirm = () => {
    if (restoreModal.topic) {
      router.put(
        route("admin.topics.restore", [
          currentSubject.id,
          restoreModal.topic.id,
        ]),
        {
          onSuccess: () => {
            setRestoreModal({ isOpen: false, topic: null });
          },
        },
      );
    }
  };

  const handleRestoreCancel = () => {
    setRestoreModal({ isOpen: false, topic: null });
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { 
            label: user.role_id === 1 ? "Admin Panel" : "Admin", 
            href: user.role_id === 1 ? route("admin.super.dashboard") : route("admin.dashboard") 
          },
          { label: "Subjects", href: route("admin.subjects") },
          {
            label: currentSubject ? currentSubject.name : "Topics",
            href: currentSubject ? route("admin.subjects.edit", currentSubject.id) : route("admin.subjects") 
          },
          {
            label: "Topics",
            href: route("admin.topics.by-subject", currentSubject?.id || ""),
          },
        ]}
      />
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">
        {currentSubject ? `Topics for ${currentSubject.name}` : "Topics"}
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <SearchBar
          placeholder="Search topics..."
          routeName="topics.by-subject"
          routeParams={{ subject: currentSubject.id }}
        />
        <Link
          className="btn-indigo focus:outline-none w-full sm:w-auto"
          href={route("admin.topics.create", currentSubject.id)}
        >
          <span>Create</span>
          <span className="hidden md:inline"> Topic</span>
        </Link>
      </div>
      <SortableTable
        columns={[
          {
            label: "Name",
            name: "name",
            renderCell: (row) => (
              <>
                <>{row.name}</>
                {row.deleted_at && (
                  <Trash2 size={16} className="ml-2 text-gray-400" />
                )}
              </>
            ),
          },
          {
            label: "Price",
            name: "price_per_session",
            renderCell: (row) =>
              `$${parseFloat(row.price_per_session).toFixed(2)}`,
          },
          {
            label: "Duration",
            name: "duration",
            renderCell: (row) =>
              `${row.duration} hour${row.duration > 1 ? "s" : ""}`,
          },
          {
            label: "Description",
            name: "description",
            renderCell: (row) => (
              <div className="max-w-[200px] truncate" title={row.description}>
                {row.description}
              </div>
            ),
          },
          {
            label: "Created",
            name: "created_at",
            renderCell: (row) => (
              <div className="text-gray-500 text-sm">
                {new Date(row.created_at).toLocaleDateString()}
              </div>
            ),
          },
          {
            label: "Actions",
            name: "actions",
            sortable: false,
            renderCell: (row) => (
              <div className="flex items-center space-x-2">
                <Link
                  href={route("admin.topics.edit", [currentSubject.id, row.id])}
                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                  title="Edit Topic"
                >
                  <Edit size={16} />
                </Link>
                {row.deleted_at ? (
                  <button
                    onClick={() => handleRestoreClick(row)}
                    className="text-green-600 hover:text-green-900 transition-colors"
                    title="Restore Topic"
                  >
                    <RotateCcw size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteClick(row)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete Topic"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={tableData}
        onSort={handleSort}
        currentSortBy={filters?.sort_by || "name"}
        currentSortOrder={filters?.sort_order || "asc"}
      />
      <Pagination links={Array.isArray(links) ? links : []} />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        message={`Are you sure you want to delete "${deleteModal.topic?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />

      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={handleRestoreCancel}
        onConfirm={handleRestoreConfirm}
        title="Restore Topic"
        message={`Are you sure you want to restore "${restoreModal.topic?.name}"?`}
        confirmText="Restore"
        cancelText="Cancel"
        confirmVariant="success"
      />
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Index.layout = (page) => <MainLayout title="Topics" children={page} />;

export default Index;

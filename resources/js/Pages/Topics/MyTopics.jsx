import { Head, Link, usePage, router } from "@inertiajs/react";
import { Trash2, Edit, RotateCcw, Plus } from "lucide-react";
import { useState } from "react";

import MainLayout from "@/Layouts/MainLayout";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Pagination from "@/Components/Pagination/Pagination";
import SortableTable from "@/Components/Table/SortableTable";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import LinkButton from "@/Components/LinkButton";

const MyTopics = () => {
  const { topics, filters } = usePage().props;
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
    router.get(
      route("topics.my-topics"),
      {
        sort_by: columnName,
        sort_order: sortOrder,
        search: filters?.search || "",
        trashed: filters?.trashed || "",
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleDeleteClick = (topic) => {
    setDeleteModal({ isOpen: true, topic });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.topic) {
      router.delete(
        route("topics.destroy", [
          deleteModal.topic.subject_id,
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
        route("topics.restore", [
          restoreModal.topic.subject_id,
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

  const columns = [
    {
      name: "name",
      label: "Topic Name",
      renderCell: (row) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      name: "subject.name",
      label: "Subject",
      renderCell: (row) => (
        <div className="text-gray-600">{row.subject?.name || "N/A"}</div>
      ),
    },
    {
      name: "price_per_session",
      label: "Price",
      renderCell: (row) => (
        <div className="text-gray-900">${row.price_per_session}</div>
      ),
    },
    {
      name: "duration",
      label: "Duration",
      renderCell: (row) => (
        <div className="text-gray-600">
          {row.duration} hour{row.duration !== 1 ? "s" : ""}
        </div>
      ),
    },
    {
      name: "created_at",
      label: "Created",
      renderCell: (row) => (
        <div className="text-gray-500 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "actions",
      label: "Actions",
      sortable: false,
      renderCell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={route("topics.edit", [row.subject_id, row.id])}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit size={16} />
          </Link>
          {row.deleted_at ? (
            <button
              onClick={() => handleRestoreClick(row)}
              className="text-green-600 hover:text-green-900"
            >
              <RotateCcw size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleDeleteClick(row)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Head title="My Topics" />

      {/* Header with breadcrumbs and action button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <Breadcrumbs items={[{ label: "My Topics", href: "#" }]} />
        <div className="flex-shrink-0">
          <LinkButton href={route("subjects")} className="btn-secondary">
            <Plus size={16} className="mr-2" />
            Manage Subjects
          </LinkButton>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <SearchBar placeholder="Search topics..." />
      </div>

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <SortableTable
          columns={columns}
          rows={tableData}
          onSort={handleSort}
          currentSortBy={filters?.sort_by || "name"}
          currentSortOrder={filters?.sort_order || "asc"}
        />
      </div>

      <Pagination links={links} />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        message={`Are you sure you want to delete "${deleteModal.topic?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={handleRestoreCancel}
        onConfirm={handleRestoreConfirm}
        title="Restore Topic"
        message={`Are you sure you want to restore "${restoreModal.topic?.name}"?`}
        confirmText="Restore"
        confirmVariant="primary"
      />
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 */
MyTopics.layout = (page) => <MainLayout title="My Topics" children={page} />;

export default MyTopics;

import { Link, usePage, router } from "@inertiajs/react";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import MainLayout from "@/Layouts/MainLayout";
import Pagination from "@/Components/Pagination/Pagination";
import SortableTable from "@/Components/Table/SortableTable";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";

const Index = () => {
  const { roles, filters, auth } = usePage().props;
  const user = auth.user;
  const { data, links } = roles;
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, role: null });

  const handleSort = (columnName, sortOrder) => {
    router.get(
      route("admin.roles.index"),
      {
        sort_by: columnName,
        sort_order: sortOrder,
      },
      { preserveState: true, replace: true },
    );
  };

  const handleDeleteClick = (role) => {
    setDeleteModal({ isOpen: true, role });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.role) {
      router.delete(route("admin.roles.destroy", deleteModal.role.id), {
        onSuccess: () => setDeleteModal({ isOpen: false, role: null }),
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, role: null });
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { 
          label: user.role_id === 1 ? "Admin Panel" : "Admin", 
          href: user.role_id === 1 ? route("admin.super.dashboard") : route("admin.dashboard") 
        },
          { label: "Roles", href: route("admin.roles.index") },
        ]}
      />
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">Roles</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <div />
        <Link
          className="btn-indigo focus:outline-none w-full sm:w-auto"
          href={route("admin.roles.create")}
        >
          <span>Create</span>
          <span className="hidden md:inline"> Role</span>
        </Link>
      </div>
      <SortableTable
        columns={[
          {
            label: "Name",
            name: "name",
            renderCell: (row) => row.name,
          },
          {
            label: "Actions",
            name: "actions",
            sortable: false,
            renderCell: (row) => (
              <div className="flex items-center space-x-2">
                <Link
                  href={route("admin.roles.edit", row.id)}
                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                  title="Edit Role"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDeleteClick(row)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                  title="Delete Role"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={data}
        onSort={handleSort}
        currentSortBy={filters?.sort_by || "name"}
        currentSortOrder={filters?.sort_order || "asc"}
      />
      <Pagination links={Array.isArray(links) ? links : []} />
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

Index.layout = (page) => <MainLayout title="Roles">{page}</MainLayout>;

export default Index;

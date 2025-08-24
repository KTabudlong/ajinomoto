import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';
import Breadcrumbs from '@/Components/Breadcrumbs/Breadcrumbs';
import SearchBar from '@/Components/SearchBar/SearchBar';
import Pagination from '@/Components/Pagination/Pagination';
import SortableTable from '@/Components/Table/SortableTable';
import ConfirmationModal from '@/Components/Modal/ConfirmationModal';

const AdminSettingsIndex = ({ settings, filters }) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    setting: null,
  });

  // Handle ResourceCollection nested structure
  const data = settings.data?.data || settings.data || settings;
  const links = settings.data?.links || settings.links || [];

  // Ensure data is an array for the table
  const tableData = Array.isArray(data) ? data : [];

  const handleSort = (columnName, sortOrder) => {
          router.get(
        route('admin.super.settings.index'),
        {
          sort_by: columnName,
          sort_order: sortOrder,
          search: filters?.search || '',
        },
        {
          preserveState: true,
          replace: true,
        },
      );
  };

  const handleDelete = (setting) => {
    setDeleteModal({ isOpen: true, setting });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.setting) {
              router.delete(route('admin.super.settings.destroy', deleteModal.setting.id), {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, setting: null });
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, setting: null });
  };

  const formatValue = (value) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) || typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2);
      }
      return parsed;
    } catch {
      return value;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Admin Panel", href: route("admin.super.dashboard") },
          { label: "Settings", href: route("admin.super.settings.index") },
        ]}
      />
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
                  <p className="text-sm text-gray-600">
            Manage global application settings and configurations for the admin panel
          </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <SearchBar placeholder="Search settings..." />
        <Link
          href={route('admin.super.settings.create')}
          className="btn-indigo focus:outline-none w-full sm:w-auto"
        >
          <span>Add Setting</span>
        </Link>
      </div>

      {/* Settings Table */}
      <SortableTable
        columns={[
          {
            label: 'Key',
            name: 'key',
            sortable: true,
            renderCell: (row) => (
              <span className="font-medium text-gray-900">{row.key}</span>
            ),
          },
          {
            label: 'Value',
            name: 'value',
            sortable: false,
            renderCell: (row) => (
              <div className="max-w-xs">
                <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                  {formatValue(row.value)}
                </pre>
              </div>
            ),
          },
          {
            label: 'Description',
            name: 'description',
            sortable: false,
            renderCell: (row) => (
              <span className="text-gray-900">{row.description}</span>
            ),
          },
          {
            label: 'Actions',
            name: 'actions',
            sortable: false,
            renderCell: (row) => (
              <div className="flex justify-end space-x-2">
                <Link
                  href={route('admin.super.settings.edit', row.id)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(row)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        rows={tableData}
        currentSortBy={filters?.sort_by || 'key'}
        currentSortOrder={filters?.sort_order || 'asc'}
        onSort={handleSort}
                  emptyStateMessage="No admin panel settings found."
      />

      {/* Pagination */}
      {links.length > 0 && (
        <div className="mt-6">
          <Pagination links={links} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Setting"
        message={`Are you sure you want to delete the setting "${deleteModal.setting?.key}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

AdminSettingsIndex.layout = (page) => (
        <MainLayout title="Admin Panel">{page}</MainLayout>
);

export default AdminSettingsIndex;

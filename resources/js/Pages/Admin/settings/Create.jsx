import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';
import Breadcrumbs from '@/Components/Breadcrumbs/Breadcrumbs';
import TextInput from '@/Components/Form/TextInput';
import TextArea from '@/Components/Form/TextArea';
import FieldGroup from '@/Components/Form/FieldGroup';
import LoadingButton from '@/Components/Button/LoadingButton';

const AdminSettingsCreate = ({ errors }) => {
  const { data, setData, post, processing } = useForm({
    key: '',
    value: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
          post(route('admin.super.settings.store'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Admin Panel", href: route("admin.super.dashboard") },
          { label: "Settings", href: route("admin.super.settings.index") },
          { label: "Create", href: route("admin.super.settings.create") },
        ]}
      />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <a
            href={route('admin.super.settings.index')}
            className="text-indigo-900 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Add Admin Panel Setting</h1>
        </div>
        <p className="text-sm text-gray-600">
          Create a new global application setting
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <FieldGroup label="Setting Key" name="key" error={errors?.key}>
              <TextInput
                name="key"
                error={errors?.key}
                value={data.key}
                onChange={(e) => setData('key', e.target.value)}
                placeholder="e.g., time_buffer_hours"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Unique identifier for this setting (use snake_case)
              </p>
            </FieldGroup>
          </div>

          <div>
            <FieldGroup label="Setting Value" name="value" error={errors?.value}>
              <TextArea
                name="value"
                error={errors?.value}
                value={data.value}
                onChange={(e) => setData('value', e.target.value)}
                placeholder="e.g., 2"
                required
                rows={4}
              />
              <p className="text-sm text-gray-600 mt-1">
                The value for this setting. For JSON values, use valid JSON format.
              </p>
            </FieldGroup>
          </div>

          <div>
            <FieldGroup label="Description" name="description" error={errors?.description}>
              <TextArea
                name="description"
                error={errors?.description}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="e.g., Minimum hours in advance required for scheduling"
                rows={3}
              />
              <p className="text-sm text-gray-600 mt-1">
                Human-readable description of what this setting controls
              </p>
            </FieldGroup>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={route('admin.super.settings.index')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <LoadingButton
              loading={processing}
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Setting
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

AdminSettingsCreate.layout = (page) => (
        <MainLayout title="Add Admin Panel Setting">{page}</MainLayout>
);

export default AdminSettingsCreate;

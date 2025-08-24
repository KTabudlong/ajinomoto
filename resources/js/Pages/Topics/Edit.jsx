import React from "react";
import { Head } from "@inertiajs/react";
import { usePage, useForm, router } from "@inertiajs/react";

import MainLayout from "@/Layouts/MainLayout";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import DeleteButton from "@/Components/Button/DeleteButton";
import LoadingButton from "@/Components/Button/LoadingButton";
import TextInput from "@/Components/Form/TextInput";
import TextArea from "@/Components/Form/TextArea";
import SelectInput from "@/Components/Form/SelectInput";
import TrashedMessage from "@/Components/Messages/TrashedMessage";
import FieldGroup from "@/Components/Form/FieldGroup";
import LinkButton from "@/Components/LinkButton";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";

const Edit = () => {
  const { topic, currentSubject, auth } = usePage().props;
  const user = auth.user;

  const { data, setData, errors, post, processing } = useForm({
    name: topic.name || "",
    description: topic.description || "",
    price_per_session: topic.price_per_session || "",
    duration: topic.duration || 1,
    _method: "put",
  });

  const [deleteModal, setDeleteModal] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    post(route("topics.update", [currentSubject.id, topic.id]));
  }

  function handleDeleteClick() {
    setDeleteModal(true);
  }

  function handleDeleteConfirm() {
    router.delete(route("topics.destroy", [currentSubject.id, topic.id]));
    setDeleteModal(false);
  }

  function handleDeleteCancel() {
    setDeleteModal(false);
  }

  function restore() {
    if (confirm("Are you sure you want to restore this topic?")) {
      router.put(route("topics.restore", [currentSubject.id, topic.id]));
    }
  }

  return (
    <div>
      <Head title={`${data.name}`} />
      <Breadcrumbs
        items={[
          { 
            label: user.role_id === 1 ? "Admin Panel" : "Admin", 
            href: user.role_id === 1 ? route("admin.super.dashboard") : route("admin.dashboard") 
          },
          { label: "Subjects", href: route("admin.subjects") },
          {
            label: currentSubject.name,
            href: route("admin.subjects.edit", currentSubject.id),
          },
          {
            label: "Topics",
            href: route("admin.topics.by-subject", currentSubject.id),
          },
          { label: data.name, href: route("admin.topics.edit", [currentSubject.id, topic.id]) },
        ]}
      />
      {topic.deleted_at && (
        <TrashedMessage
          message="This topic has been deleted."
          onRestore={restore}
        />
      )}
      <div className="max-w-3xl overflow-hidden bg-white rounded shadow">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Topic</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 grid-cols-1 lg:grid-cols-2">
            <FieldGroup label="Topic Name" name="name" error={errors.name}>
              <TextInput
                name="name"
                error={errors.name}
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Subject" name="subject">
              <div className="text-gray-700 py-2 px-3 bg-gray-50 border border-gray-300 rounded-md">
                {currentSubject.name}
              </div>
            </FieldGroup>

            <FieldGroup
              label="Price per Session"
              name="price_per_session"
              error={errors.price_per_session}
            >
              <TextInput
                name="price_per_session"
                type="number"
                step="0.01"
                min="0"
                error={errors.price_per_session}
                value={data.price_per_session}
                onChange={(e) => setData("price_per_session", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup
              label="Duration (hours)"
              name="duration"
              error={errors.duration}
            >
              <SelectInput
                name="duration"
                error={errors.duration}
                value={data.duration}
                onChange={(e) => setData("duration", e.target.value)}
                options={[
                  { value: 1, label: "1 hour" },
                  { value: 2, label: "2 hours" },
                ]}
              />
            </FieldGroup>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <FieldGroup
              label="Description"
              name="description"
              error={errors.description}
            >
              <TextArea
                name="description"
                error={errors.description}
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                rows={6}
                placeholder="Enter a detailed description of this topic..."
              />
            </FieldGroup>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 border-t border-gray-200">
            {!topic.deleted_at && (
              <DeleteButton onDelete={handleDeleteClick}>
                Delete Topic
              </DeleteButton>
            )}
            <div className="flex items-center gap-4 sm:ml-auto">
              <LinkButton
                href={route("topics.by-subject", currentSubject.id)}
                className="!px-6 !py-3 !text-sm !font-bold !tracking-normal"
                variant="gray"
              >
                Back
              </LinkButton>
              <LoadingButton
                loading={processing}
                type="submit"
                className="btn-indigo"
              >
                Update Topic
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Edit.layout = (page) => <MainLayout title="Edit Topic" children={page} />;

export default Edit;

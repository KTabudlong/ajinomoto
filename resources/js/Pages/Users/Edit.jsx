import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { usePage, useForm, router } from "@inertiajs/react";

import MainLayout from "@/Layouts/MainLayout";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import DeleteButton from "@/Components/Button/DeleteButton";
import LoadingButton from "@/Components/Button/LoadingButton";
import TextInput from "@/Components/Form/TextInput";
import FileInput from "@/Components/Form/FileInput";
import TrashedMessage from "@/Components/Messages/TrashedMessage";
import FieldGroup from "@/Components/Form/FieldGroup";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import BackButton from "@/Components/Button/BackButton";

const Edit = () => {
  const { user } = usePage().props;
  const authUser = usePage().props.auth.user;
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, setData, errors, post, processing } = useForm({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    password: user.password || "",
    avatar: "",
    _method: "put",
  });

  // Track if form is dirty
  useEffect(() => {
    setIsDirty(
      data.first_name !== (user.first_name || "") ||
        data.last_name !== (user.last_name || "") ||
        data.email !== (user.email || "") ||
        data.password !== (user.password || ""),
    );
  }, [data, user]);

  // Intercept navigation if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleBack = (e) => {
    if (isDirty) {
      e.preventDefault();
      setShowConfirm(true);
              setNextUrl(route("admin.users"));
    } else {
        router.visit(route("admin.users"));
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirm(false);
    if (nextUrl) router.visit(nextUrl);
  };

  function handleSubmit(e) {
    e.preventDefault();
    post(route("admin.users.update", user.id));
  }

  function handleDeleteClick() {
    setDeleteModal(true);
  }

  function handleDeleteConfirm() {
    router.delete(route("admin.users.destroy", user.id));
    setDeleteModal(false);
  }

  function handleDeleteCancel() {
    setDeleteModal(false);
  }

  function restore() {
    if (confirm("Are you sure you want to restore this user?")) {
      router.put(route("admin.users.restore", user.id));
    }
  }

  return (
    <div>
      <Head title={`${data.first_name} ${data.last_name}`} />
      {/* If editing self, show a button to My Profile page */}
      {user.id === authUser.id && (
        <div className="mb-4">
          <a
                            href={route("admin.profile.edit")}
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Go to My Profile
          </a>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <Breadcrumbs
          items={[
            { label: "Users", href: route("admin.users") },
            { label: `${data.first_name} ${data.last_name}`, href: "#" },
          ]}
        />
        {user.photo && (
          <img className="block w-8 h-8 rounded-full" src={user.photo} />
        )}
      </div>
      {user.deleted_at && (
        <TrashedMessage
          message="This user has been deleted."
          onRestore={restore}
        />
      )}
      <div className="max-w-3xl overflow-hidden bg-white rounded shadow">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 grid-cols-1 lg:grid-cols-2">
            <FieldGroup
              label="First Name"
              name="first_name"
              error={errors.first_name}
            >
              <TextInput
                name="first_name"
                error={errors.first_name}
                value={data.first_name}
                onChange={(e) => setData("first_name", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup
              label="Last Name"
              name="last_name"
              error={errors.last_name}
            >
              <TextInput
                name="last_name"
                error={errors.last_name}
                value={data.last_name}
                onChange={(e) => setData("last_name", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup label="Email" name="email" error={errors.email}>
              <TextInput
                name="email"
                type="email"
                error={errors.email}
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup
              label="Password"
              name="password"
              error={errors.password}
            >
              <TextInput
                name="password"
                type="password"
                error={errors.password}
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
              />
            </FieldGroup>

            {/* <FieldGroup label="Owner" name="owner" error={errors.owner}>
              <SelectInput
                name="owner"
                error={errors.owner}
                value={data.owner}
                onChange={e => setData('owner', e.target.value)}
                options={[
                  { value: '1', label: 'Yes' },
                  { value: '0', label: 'No' }
                ]}
              />
            </FieldGroup> */}

            {/* <FieldGroup label="Avatar" name="avatar" error={errors.avatar}>
              <FileInput
                name="avatar"
                accept="image/*"
                error={errors.avatar}
                value={data.avatar}
                onChange={(avatar) => {
                  setData("avatar", avatar);
                }}
              />
            </FieldGroup> */}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 border-t border-gray-200">
            {!user.deleted_at && (
              <DeleteButton onDelete={handleDeleteClick}>
                Delete User
              </DeleteButton>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <BackButton href={route("admin.users")} />
              <LoadingButton
                loading={processing}
                type="submit"
                className="btn-indigo"
              >
                Update User
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
      {/* Confirmation Modal for unsaved changes */}
      <ConfirmationModal
        show={showConfirm}
        title="Unsaved Changes"
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmLeave}
        confirmText="Leave Page"
        confirmVariant="danger"
      >
        <p>
          You have unsaved changes. Are you sure you want to leave this page?
        </p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
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
Edit.layout = (page) => <MainLayout title="Edit User" children={page} />;

export default Edit;

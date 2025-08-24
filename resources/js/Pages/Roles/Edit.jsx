import React from "react";
import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import LoadingButton from "@/Components/Button/LoadingButton";
import PrimaryButton from "@/Components/PrimaryButton";
import LinkButton from "@/Components/LinkButton";
import TextInput from "@/Components/Form/TextInput";
import FieldGroup from "@/Components/Form/FieldGroup";
import DeleteButton from "@/Components/Button/DeleteButton";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";

const Edit = () => {
  const { role } = usePage().props;
  const { data, setData, errors, post, processing } = useForm({
    name: role.name || "",
    _method: "put",
  });

  const [deleteModal, setDeleteModal] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    post(route("admin.roles.update", role.id));
  }

  function handleDeleteClick() {
    setDeleteModal(true);
  }

  function handleDeleteConfirm() {
    router.delete(route("admin.roles.destroy", role.id));
    setDeleteModal(false);
  }

  function handleDeleteCancel() {
    setDeleteModal(false);
  }

  return (
    <div>
      <Head title={`${data.name}`} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Link
            href={route("admin.roles.index")}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Roles
          </Link>
          <span className="font-medium text-indigo-600"> /</span>
          <span>{role.name}</span>
        </div>
      </div>
      <div className="max-w-3xl overflow-hidden bg-white rounded shadow">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Role</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 grid-cols-1">
            <FieldGroup label="Role Name" name="name" error={errors.name}>
              <TextInput
                name="name"
                error={errors.name}
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
            </FieldGroup>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 border-t border-gray-200">
            <DeleteButton onDelete={handleDeleteClick}>
              Delete Role
            </DeleteButton>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:ml-auto">
              <LinkButton
                href={route("admin.roles.index")}
                className="!px-6 !py-3 !text-sm !font-bold !tracking-normal"
                variant="gray"
              >
                Back
              </LinkButton>
              <PrimaryButton type="submit" disabled={processing}>
                {processing ? "Saving..." : "Update Role"}
              </PrimaryButton>
            </div>
          </div>
        </form>
        <ConfirmationModal
          isOpen={deleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Role"
          message="Are you sure you want to delete this role? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      </div>
    </div>
  );
};

Edit.layout = (page) => <MainLayout title="Edit Role">{page}</MainLayout>;

export default Edit;

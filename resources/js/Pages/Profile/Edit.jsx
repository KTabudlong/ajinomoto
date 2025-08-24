import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import MainLayout from "@/Layouts/MainLayout";
import { usePage } from "@inertiajs/react";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";

export default function Edit({ mustVerifyEmail, status }) {
  const authUser = usePage().props.auth.user;
  return (
    <>
      <Head title="Profile" />
      <div className="mb-6 sm:mb-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: route("admin.dashboard") },
            { label: "Profile", href: route("admin.profile.edit") },
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          Profile
        </h1>
      </div>
      <div className="py-6 sm:py-12">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
          {/* 100% width parent, flex row for profile and password cards */}
          <div className="w-full flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
            <div
              className="flex-1 bg-white rounded shadow p-4 sm:p-6 lg:p-8 min-w-0"
              style={{ maxWidth: "100%" }}
            >
              <UpdateProfileInformationForm
                mustVerifyEmail={mustVerifyEmail}
                status={status}
                className="w-full"
              />
            </div>
            <div
              className="flex-1 bg-white rounded shadow p-4 sm:p-6 lg:p-8 min-w-0"
              style={{ maxWidth: "100%" }}
            >
              <UpdatePasswordForm className="w-full" />
            </div>
          </div>
          {/* Delete user form remains below, only for non-super admins */}
          {authUser.role_id !== 1 && (
            <div className="w-full overflow-hidden bg-white rounded shadow p-4 sm:p-6 lg:p-8">
              <DeleteUserForm className="w-full" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Ensure persistent layout for Inertia
Edit.layout = (page) => <MainLayout title="Profile">{page}</MainLayout>;

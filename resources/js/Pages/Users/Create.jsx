import { Link, useForm, usePage } from "@inertiajs/react";

import MainLayout from "@/Layouts/MainLayout";
import LoadingButton from "@/Components/Button/LoadingButton";
import TextInput from "@/Components/Form/TextInput";
import SelectInput from "@/Components/Form/SelectInput";
import FileInput from "@/Components/Form/FileInput";
import FieldGroup from "@/Components/Form/FieldGroup";

const Create = () => {
  const authUser = usePage().props.auth.user;
  const { data, setData, errors, post, processing } = useForm({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: authUser.role_id === 1 ? "2" : "3", // Default to Tutor for super admin, Customer for tutor
    owner: "0",
    photo: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    post(route("admin.users.store"));
  }

  return (
    <div>
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">
          <Link
            href={route("admin.users.index")}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Users
          </Link>
          <span className="font-medium text-indigo-600"> /</span> Create
        </h1>
      </div>
      <div className="max-w-3xl overflow-hidden bg-white rounded shadow">
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
              <div className="text-xs text-gray-500 mt-1">
                Password is optional when creating a user as a tutor. The
                student will set their own password via registration/invite.
              </div>
            </FieldGroup>

            {/* Only show role dropdown for super admin */}
            {authUser.role_id === 1 && (
              <FieldGroup label="Role" name="role_id" error={errors.role_id}>
                <SelectInput
                  name="role_id"
                  error={errors.role_id}
                  value={data.role_id}
                  onChange={(e) => setData("role_id", e.target.value)}
                  options={[
                    { value: "2", label: "Tutor" },
                    { value: "3", label: "Customer" },
                  ]}
                />
              </FieldGroup>
            )}

            {/* <FieldGroup label="Owner" name="owner" error={errors.owner}>
              <SelectInput
                name="owner"
                error={errors.owner}
                value={data.owner}
                onChange={(e) => setData("owner", e.target.value)}
                options={[
                  { value: "1", label: "Yes" },
                  { value: "0", label: "No" },
                ]}
              />
            </FieldGroup> */}

            {/* <FieldGroup label="Avatar" name="avatar" error={errors.avatar}>
              <FileInput
                name="avatar"
                accept="image/*"
                error={errors.avatar}
                value={data.avatar}
                onChange={(avatar) => setData("avatar", avatar)}
              />
            </FieldGroup> */}
          </div>
          <div className="flex items-center justify-end px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 border-t border-gray-200">
            <LoadingButton
              loading={processing}
              type="submit"
              className="btn-indigo"
            >
              Create User
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Create.layout = (page) => <MainLayout title="Create User" children={page} />;

export default Create;

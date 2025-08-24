import { Link, useForm } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import LoadingButton from "@/Components/Button/LoadingButton";
import TextInput from "@/Components/Form/TextInput";
import FieldGroup from "@/Components/Form/FieldGroup";

const Create = () => {
  const { data, setData, errors, post, processing } = useForm({
    name: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    post(route("admin.roles.store"));
  }

  return (
    <div>
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">
          <Link
            href={route("admin.roles.index")}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Roles
          </Link>
          <span className="font-medium text-indigo-600"> /</span> Create
        </h1>
      </div>
      <div className="max-w-3xl overflow-hidden bg-white rounded shadow">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Role</h2>
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
          <div className="flex items-center justify-end gap-4 px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 border-t border-gray-200">
            <Link className="btn-secondary" href={route("admin.roles.index")}>
              Back
            </Link>
            <LoadingButton
              loading={processing}
              type="submit"
              className="btn-indigo"
            >
              Create Role
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

Create.layout = (page) => <MainLayout title="Create Role">{page}</MainLayout>;

export default Create;

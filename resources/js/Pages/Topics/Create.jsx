import { Link, useForm, usePage } from "@inertiajs/react";

import MainLayout from "@/Layouts/MainLayout";
import LoadingButton from "@/Components/Button/LoadingButton";
import TextInput from "@/Components/Form/TextInput";
import TextArea from "@/Components/Form/TextArea";
import SelectInput from "@/Components/Form/SelectInput";
import FieldGroup from "@/Components/Form/FieldGroup";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";

const Create = () => {
  const { subjects, currentSubject, auth } = usePage().props;
  const user = auth.user;

  const { data, setData, errors, post, processing } = useForm({
    name: "",
    description: "",
    price_per_session: "",
    duration: 1,
    subject_id: currentSubject ? currentSubject.id.toString() : "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    // Use currentSubject.id if present, otherwise use data.subject_id
    const subjectId = currentSubject ? currentSubject.id : data.subject_id;
    post(route("admin.topics.store", { subject: subjectId }));
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { 
            label: user.role_id === 1 ? "Admin Panel" : "Admin", 
            href: user.role_id === 1 ? route("admin.super.dashboard") : route("admin.dashboard") 
          },
          { label: "Subjects", href: route("admin.subjects") },
          {
            label: currentSubject ? currentSubject.name : "Topics",
            href: currentSubject ? route("admin.subjects.edit", currentSubject.id) : route("admin.subjects") 
          },
          {
            label: "Topics",
            href: route("admin.topics.by-subject", currentSubject?.id || ""),
          },
          { label: "Create", href: route("admin.topics.create", currentSubject?.id || "") },
        ]}
      />
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold">
          <Link
            href={route("admin.topics.index")}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Topics
          </Link>
          <span className="font-medium text-indigo-600"> /</span> Create
        </h1>
      </div>
      <div className="max-w-3xl overflow-hidden bg-white rounded shadow">
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

            <FieldGroup
              label="Subject"
              name="subject_id"
              error={errors.subject_id}
            >
              <SelectInput
                name="subject_id"
                error={errors.subject_id}
                value={data.subject_id}
                onChange={(e) => setData("subject_id", e.target.value)}
                options={
                  currentSubject
                    ? [
                        {
                          value: currentSubject.id.toString(),
                          label: currentSubject.name,
                        },
                      ]
                    : [
                        { value: "", label: "Select a subject" },
                        ...(subjects?.map((subject) => ({
                          value: subject.id.toString(),
                          label: subject.name,
                        })) || []),
                      ]
                }
                disabled={!!currentSubject}
              />
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 border-t border-gray-200">
            <Link
              className="btn-secondary"
              href={
                currentSubject
                  ? route("admin.topics.by-subject", currentSubject.id)
                  : route("admin.topics.index")
              }
            >
              Back
            </Link>
            <LoadingButton
              loading={processing}
              type="submit"
              className="btn-indigo"
            >
              Create Topic
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
Create.layout = (page) => <MainLayout title="Create Topic" children={page} />;

export default Create;

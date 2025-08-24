import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import FieldGroup from "@/Components/Form/FieldGroup";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import timezones from "timezones-list";
import Select from "react-select";

export default function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = "",
}) {
  const user = usePage().props.auth.user;

  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
      name: user.name,
      email: user.email,
      timezone: user.timezone || "America/Chicago",
    });

  const submit = (e) => {
    e.preventDefault();

    patch(route("admin.profile.update"));
  };

  // Build timezone options for react-select
  const timezoneOptions = timezones.map((tz) => ({
    value: tz.tzCode,
    label: tz.label,
  }));
  const selectedTimezone = timezoneOptions.find(
    (opt) => opt.value === data.timezone,
  );

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your account's profile information and email address.
        </p>
      </header>
      <form onSubmit={submit} className="mt-6 space-y-6">
        <FieldGroup label="Name" name="name" error={errors.name}>
          <TextInput
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            required
            isFocused
            autoComplete="name"
          />
        </FieldGroup>
        <FieldGroup label="Email" name="email" error={errors.email}>
          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            required
            autoComplete="username"
          />
        </FieldGroup>
        <FieldGroup label="Timezone" name="timezone" error={errors.timezone}>
          <Select
            className="mt-1 block w-full"
            value={selectedTimezone}
            onChange={(opt) => setData("timezone", opt.value)}
            options={timezoneOptions}
            isSearchable
            placeholder="Select timezone..."
          />
        </FieldGroup>
        {/* Verification notice */}
        {mustVerifyEmail && user.email_verified_at === null && (
          <div className="col-span-2">
            <p className="mt-2 text-sm text-gray-800">
              Your email address is unverified.
              <Link
                href={route("verification.send")}
                method="post"
                as="button"
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Click here to re-send the verification email.
              </Link>
            </p>
            {status === "verification-link-sent" && (
              <div className="mt-2 text-sm font-medium text-green-600">
                A new verification link has been sent to your email address.
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
          <PrimaryButton disabled={processing}>Save</PrimaryButton>
          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-gray-600 ml-4">Saved.</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}

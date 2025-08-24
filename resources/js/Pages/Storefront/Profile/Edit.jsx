import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/Components/Button/Button";
import { Input } from "@/Components/Form/Input";
import { Label } from "@/Components/Form/Label";
import { Textarea } from "@/Components/Form/Textarea";
import { Breadcrumbs } from "@/Components/Breadcrumbs/Breadcrumbs";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function StorefrontProfileEdit({ auth, mustVerifyEmail, status }) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

  const { data, setData, patch, errors, processing } = useForm({
    name: auth.user.name,
    email: auth.user.email,
    bio: auth.user.bio || "",
    phone: auth.user.phone || "",
    timezone: auth.user.timezone || "America/Chicago",
  });

  const submit = (e) => {
    e.preventDefault();
    patch(route("storefront.profile.update"));
  };

  return (
    <StorefrontLayout user={auth.user}>
      <Head title="Profile" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Home", href: route("home") },
                  { label: "Profile", href: route("storefront.profile.edit") },
                ]}
              />
            </div>

            <section>
              <header>
                <h2 className="text-lg font-medium text-gray-900">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Update your account's profile information and email address.
                </p>
              </header>

              <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="mt-1 block w-full"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    required
                    autoComplete="username"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="mt-1 block w-full"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.timezone}
                    onChange={(e) => setData("timezone", e.target.value)}
                  >
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </select>
                  {errors.timezone && (
                    <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="mt-1 block w-full"
                    value={data.bio}
                    onChange={(e) => setData("bio", e.target.value)}
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                  )}
                </div>

                {mustVerifyEmail && (
                  <div>
                    <p className="text-sm mt-2 text-gray-800">
                      Your email address is unverified.
                      <a
                        href={route("verification.send")}
                        className="text-gray-600 underline rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-1"
                      >
                        Click here to re-send the verification email.
                      </a>
                    </p>

                    {status === "verification-link-sent" && (
                      <div className="mt-2 font-medium text-sm text-green-600">
                        A new verification link has been sent to your email address.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button disabled={processing}>Save</Button>

                  {status && (
                    <p className="text-sm text-gray-600">{status}</p>
                  )}
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}

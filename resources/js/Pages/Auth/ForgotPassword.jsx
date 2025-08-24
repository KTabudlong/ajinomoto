import { Head, useForm } from "@inertiajs/react";

import TextInput from "@/Components/Form/TextInput";
import Logo from "@/Components/Logo/Logo";
import FieldGroup from "@/Components/Form/FieldGroup";
import LoadingButton from "@/Components/Button/LoadingButton";

export default function ForgotPassword() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
  });

  const submit = (e) => {
    e.preventDefault();

    post(route("password.email"));
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-indigo-900">
      <Head title="Login" />

      <div className="w-full max-w-md">
        <Logo
          className="block w-full max-w-xs mx-auto text-white fill-current"
          height={50}
        />
        <form
          onSubmit={submit}
          className="mt-8 overflow-hidden bg-white rounded-lg shadow-xl"
        >
          <div className="px-10 py-12">
            <h1 className="text-3xl font-bold text-center">Forgot Password?</h1>
            <div className="w-24 mx-auto mt-6 border-b-2" />
            <div className="mb-4 text-sm text-gray-600 mt-4">
              Forgot your password? No problem. Just let us know your email
              address and we will email you a password reset link that will
              allow you to choose a new one.
            </div>
            <div className="grid gap-6">
              <FieldGroup label="Email" name="email" error={errors.email}>
                <TextInput
                  name="email"
                  type="email"
                  error={errors.email}
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                />
              </FieldGroup>
            </div>
          </div>
          <div className="flex items-center justify-center px-10 py-4 bg-gray-100 border-t border-gray-200">
            <LoadingButton
              type="submit"
              loading={processing}
              className="btn-indigo"
            >
              Email Password Reset Link
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}

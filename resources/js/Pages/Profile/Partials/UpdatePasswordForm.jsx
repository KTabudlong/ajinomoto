import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function UpdatePasswordForm({ className = "" }) {
  const passwordInput = useRef();
  const currentPasswordInput = useRef();
  const [passwordStrength, setPasswordStrength] = useState("");

  const { data, setData, errors, put, reset, processing, recentlySuccessful } =
    useForm({
      current_password: "",
      password: "",
      password_confirmation: "",
    });

  // Simple password strength checker
  function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    if (score === 5) return "Strong";
    return "";
  }

  const updatePassword = (e) => {
    e.preventDefault();

    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => reset(),
      onError: (errors) => {
        if (errors.password) {
          reset("password", "password_confirmation");
          passwordInput.current.focus();
        }

        if (errors.current_password) {
          reset("current_password");
          currentPasswordInput.current.focus();
        }
      },
    });
  };

  // Update password strength on password input change
  function handlePasswordChange(e) {
    setData("password", e.target.value);
    setPasswordStrength(checkPasswordStrength(e.target.value));
  }

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Update Password</h2>

        <p className="mt-1 text-sm text-gray-600">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </header>

      <form onSubmit={updatePassword} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="current_password" value="Current Password" />

          <TextInput
            id="current_password"
            ref={currentPasswordInput}
            value={data.current_password}
            onChange={(e) => setData("current_password", e.target.value)}
            type="password"
            className="mt-1 block w-full"
            autoComplete="current-password"
          />

          <InputError message={errors.current_password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value="New Password" />

          <TextInput
            id="password"
            ref={passwordInput}
            value={data.password}
            onChange={handlePasswordChange}
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />

          {data.password && (
            <div className="mt-2">
              <div
                className={`h-2 rounded transition-all ${
                  passwordStrength === "Weak"
                    ? "bg-red-400 w-1/3"
                    : passwordStrength === "Medium"
                      ? "bg-yellow-400 w-2/3"
                      : passwordStrength === "Strong"
                        ? "bg-green-500 w-full"
                        : "bg-gray-200"
                }`}
              ></div>
              <span
                className={`text-xs font-semibold ${
                  passwordStrength === "Weak"
                    ? "text-red-500"
                    : passwordStrength === "Medium"
                      ? "text-yellow-600"
                      : passwordStrength === "Strong"
                        ? "text-green-600"
                        : "text-gray-400"
                }`}
              >
                {passwordStrength} Password
              </span>
            </div>
          )}

          <InputError message={errors.password} className="mt-2" />
        </div>

        <div>
          <InputLabel
            htmlFor="password_confirmation"
            value="Confirm Password"
          />

          <TextInput
            id="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) => setData("password_confirmation", e.target.value)}
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />

          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>Save</PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-gray-600">Saved.</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}

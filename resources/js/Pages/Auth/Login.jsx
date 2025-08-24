import { Head, Link, useForm } from '@inertiajs/react';

import Logo from '@/Components/Logo/Logo';
import LoadingButton from '@/Components/Button/LoadingButton';
import TextInput from '@/Components/Form/TextInput';
import FieldGroup from '@/Components/Form/FieldGroup';
import { CheckboxInput } from '@/Components/Form/CheckboxInput';

export default function Login({ canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: 'test@last.com',
    password: 'test123',
    remember: false,
  });

  const submit = e => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-indigo-900">
      <Head title="Login" />

      <div className="w-full max-w-md">
        <Logo
          className="block w-full max-w-xs mx-auto text-white fill-current"
          height={50}
        />
        <form
          onSubmit={submit}
          className="mt-6 sm:mt-8 overflow-hidden bg-white rounded-lg shadow-xl"
        >
          <div className="px-6 sm:px-10 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              Welcome Back!
            </h1>
            <div className="w-24 mx-auto mt-4 sm:mt-6 border-b-2" />
            <div className="grid gap-4 sm:gap-6">
              <FieldGroup label="Email" name="email" error={errors.email}>
                <TextInput
                  name="email"
                  type="email"
                  error={errors.email}
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                />
              </FieldGroup>

              <FieldGroup
                label="Password"
                name="password"
                error={errors.password}
              >
                <TextInput
                  type="password"
                  error={errors.password}
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                />
              </FieldGroup>

              <FieldGroup>
                <CheckboxInput
                  label="Remember Me"
                  name="remember"
                  id="remember"
                  checked={data.remember}
                  onChange={e => setData('remember', e.target.checked)}
                />
              </FieldGroup>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 px-6 sm:px-10 py-4 bg-gray-100 border-t border-gray-200">
            {canResetPassword && (
              <Link
                className="hover:underline text-center sm:text-left"
                tabIndex={-1}
                href={route('password.request')}
              >
                Forgot password?
              </Link>
            )}
            <LoadingButton
              type="submit"
              loading={processing}
              className="btn-indigo w-full sm:w-auto"
            >
              Login
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}

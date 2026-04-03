import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to Task Management System',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to Task Management System
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center space-y-4">
            <p className="text-gray-500">
              Login form component will be implemented here
            </p>
            <p className="text-sm text-gray-400">
              This is a placeholder page for the authentication module
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
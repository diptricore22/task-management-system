import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Manage your projects',
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">
              Manage and organize your projects
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Create Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <p className="text-gray-500 text-center">
              Projects module will be implemented here
            </p>
            <p className="text-sm text-gray-400 text-center mt-2">
              Project list, cards, and management interface
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
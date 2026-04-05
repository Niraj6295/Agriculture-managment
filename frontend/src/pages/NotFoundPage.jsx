import { Link } from 'react-router-dom';
import { Leaf, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-3xl mb-6">
          <Leaf className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-7xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-3">Page Not Found</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
          Looks like this field doesn't exist. Head back to your dashboard.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 mt-6">
          <Home size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

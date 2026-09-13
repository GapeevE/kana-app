'use client';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="p-4 bg-red-50 border-2 border-red-500 rounded-md">
      <h2 className="text-lg font-bold text-red-700">Error in Dashboard</h2>
      <p className="text-sm text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}
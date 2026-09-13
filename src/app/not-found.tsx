import Link from "next/link";

export default function NotFound() {
    return (
        <div className="p-4 bg-gray-50 border-2 border-gray-500 rounded-md">
            <h2 className="text-lg font-bold text-gray-700">404 - Page Not Found</h2>
            <p className="text-sm text-gray-600">The page you are looking for does not exist.</p>
            <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Go to Dashboard
            </Link>
        </div>
    );
}
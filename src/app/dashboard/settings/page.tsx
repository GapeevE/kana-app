import { notFound } from "next/navigation";

export default function SettingsPage() {
    const data = null 

    if (!data) notFound();

    return (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-md">
            Settings Page
        </div>
    );
}
export default async function DashboardPage() {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    // throw new Error('Simulated error in DashboardPage');

    return (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-md">
            Dashboard Page
        </div>
    );
}
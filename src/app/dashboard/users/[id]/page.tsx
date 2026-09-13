interface UserPageProps {
    params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
    const { id } = await params;

    return (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-md">
            User Page: {id}
        </div>
    );
}
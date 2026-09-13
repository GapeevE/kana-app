interface ShopPageProps {
    params: Promise<{ slug: string[] }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
    const { slug } = await params;

    const currentSlug = slug || [];
    const [category, brand, product] = currentSlug;

    return (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-md">
            Category: {category || 'N/A'}, Brand: {brand || 'N/A'}, Product: {product || 'N/A'}
        </div>
    );
}
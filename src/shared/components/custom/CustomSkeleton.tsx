
export const CustomSkeleton = () => {
    return (
        <>
            <div className="font-sans p-4 max-w-[960px] mx-auto">
                <div className="h-10 bg-black/5 rounded-lg mb-4"></div>
                <div className="flex gap-3">
                    <div className="flex-1 h-4 bg-black/5 rounded"></div>
                    <div className="w-30 h-4 bg-black/10 rounded"></div>
                </div>
            </div>
        </>
    );
}

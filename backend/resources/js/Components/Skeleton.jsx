export function Skeleton({ className='' }){
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden="true" />;
}
export function ProductCardSkeleton(){
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <Skeleton className="h-56 w-full" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
            </div>
        </div>
    );
}
export function TableSkeleton({ rows=3 }){
    return (
        <div className="space-y-2">
            {Array.from({length: rows}).map((_,i)=> <Skeleton key={i} className="h-10 w-full" />)}
        </div>
    );
}

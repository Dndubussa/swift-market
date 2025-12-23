export default function LoadingState() {
  return (
    <>
      {[...Array(6)]?.map((_, index) => (
        <div key={index} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
          <div className="w-full h-48 sm:h-56 bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="flex items-center space-x-1">
              {[...Array(5)]?.map((_, i) => (
                <div key={i} className="w-4 h-4 bg-muted rounded" />
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 bg-muted rounded w-24" />
              <div className="w-10 h-10 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
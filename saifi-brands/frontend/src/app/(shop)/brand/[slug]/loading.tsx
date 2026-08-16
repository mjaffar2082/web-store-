export default function BrandLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse bg-line" />
        <div className="mb-8 flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-line" />
          <div className="h-12 w-48 animate-pulse bg-line" />
        </div>
        <div className="aspect-[3/4] animate-pulse bg-line" />
      </div>
    </div>
  );
}
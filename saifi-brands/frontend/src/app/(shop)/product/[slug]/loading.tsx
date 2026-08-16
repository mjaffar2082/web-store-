export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse bg-line" />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse bg-line" />
          <div className="space-y-5">
            <div className="h-3 w-24 animate-pulse bg-line" />
            <div className="h-12 w-3/4 animate-pulse bg-line" />
            <div className="h-8 w-32 animate-pulse bg-line" />
            <div className="h-6 w-48 animate-pulse bg-line" />
            <div className="h-24 w-full animate-pulse bg-line" />
            <div className="h-14 w-full animate-pulse bg-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
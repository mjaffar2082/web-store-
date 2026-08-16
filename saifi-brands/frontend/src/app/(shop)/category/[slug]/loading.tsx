export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse bg-line" />
        <div className="mb-8 h-12 w-64 animate-pulse bg-line" />
        <div className="aspect-[3/4] animate-pulse bg-line" />
      </div>
    </div>
  );
}
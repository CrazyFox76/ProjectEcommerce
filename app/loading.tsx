export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200" />
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Memuat...</p>
      </div>
    </div>
  );
}

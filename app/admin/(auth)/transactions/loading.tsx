export default function Loading() {
  return (
    <main className="min-h-dvh bg-[#f7f8fa] p-4">
      <div className="mx-auto max-w-5xl animate-pulse space-y-5">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-xl bg-gray-200" />
          <div className="h-24 rounded-xl bg-gray-200" />
        </div>
        <div className="h-14 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
      </div>
    </main>
  );
}
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-4xl font-extrabold text-slate-300 mb-2">404</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Resource Not Found</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The property notice, educational article, or asset page you requested may have been archived or moved.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
        >
          Return to Discovery Home
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/properties" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Properties</Link>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Details</h1>
          <p className="text-gray-600 mb-4">Property ID: {params.id}</p>
          <p className="text-gray-500 text-sm">
            Property details will load from the database. Set up Supabase to see live data.
          </p>
          <div className="mt-6">
            <Link href="/properties" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
              ← Back to Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
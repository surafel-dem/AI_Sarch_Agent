import Link from 'next/link';

export function FloatingMenu() {
  return (
    <div className="fixed right-8 top-24 bg-white rounded-2xl shadow-lg p-6 w-[280px]">
      <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
      
      <div className="space-y-2">
        <Link 
          href="/dealer"
          className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl mr-3">🔍</span>
          <span className="text-gray-700">Find Dealer</span>
        </Link>

        <Link 
          href="/collections"
          className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl mr-3">📁</span>
          <span className="text-gray-700">Collections</span>
        </Link>

        <Link 
          href="/about"
          className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl mr-3">🚗</span>
          <span className="text-gray-700">About Cars</span>
        </Link>

        <Link 
          href="/reviews"
          className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl mr-3">⭐</span>
          <span className="text-gray-700">Car Reviews</span>
        </Link>
      </div>
    </div>
  );
}

import { SearchResponse } from '@/types/search';
import { SearchResults } from './search-results';
import ReactMarkdown from 'react-markdown';

interface SearchOutputProps {
  message: any;
}

export function SearchOutput({ message }: SearchOutputProps) {
  const formatPrice = (price: number | string | null | undefined) => {
    if (!price) return '€N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `€${numPrice.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  if (message.isLoading || message.response?.loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!message.response?.results?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message.response.results.map((car: any) => (
        <div key={car.listing_id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {car.make} {car.model}
                {car.engine && ` (${car.engine}L)`}
              </h3>
              <p className="text-gray-600">
                {car.year} 
                {car.transmission && ` • ${car.transmission}`}
              </p>
              <p className="text-lg font-bold mt-2">{formatPrice(car.price)}</p>
              <p className="text-sm text-gray-500 mt-1">{car.location}</p>
              {car.seller && (
                <p className="text-sm text-gray-500">Seller: {car.seller}</p>
              )}
            </div>
            {car.url && (
              <a 
                href={car.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Listing
              </a>
            )}
          </div>
          {car.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {car.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

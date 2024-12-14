import { SearchResponse } from '@/types/search';
import Link from 'next/link';

interface SearchOutputProps {
  message: {
    response?: SearchResponse;
    isLoading?: boolean;
  };
}

export function SearchOutput({ message }: SearchOutputProps) {
  if (message.isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!message.response?.results?.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No results found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {message.response.results.map((car, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {car.make} {car.model} {car.variant}
              </h3>
              <div className="mt-1 text-sm text-gray-500">
                {car.year} • {car.location}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                €{typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
              </div>
              <div className="text-sm text-gray-500">{car.seller_type}</div>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{car.description}</p>
          
          <div className="mt-4 flex justify-end">
            <Link
              href={`/listing/${car.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Listing →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

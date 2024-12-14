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
      <div className="space-y-3">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!message.response?.results?.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No results found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message.response.results.map((car, index) => (
        <div 
          key={index} 
          className="group border border-transparent hover:border-gray-200 rounded-lg p-3 transition-all duration-200 relative"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-base text-gray-900 truncate pr-4">
                {car.make} {car.model} {car.variant}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <span>{car.year}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{car.location}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-1 pr-4">{car.description}</p>
            </div>
            <div className="text-right flex flex-col items-end shrink-0">
              <div className="text-base font-medium text-gray-900">
                €{typeof car.price === 'number' ? car.price.toLocaleString() : car.price}
              </div>
              <div className="text-sm text-gray-500">{car.seller_type}</div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-end">
            <Link
              href={`/listing/${car.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

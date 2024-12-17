import { SearchResponse } from '@/types/search';
import { useState } from 'react';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';

interface SearchOutputProps {
  message: {
    response?: SearchResponse;
    isLoading?: boolean;
  };
  loading?: boolean;
}

export function SearchOutput({ message, loading }: SearchOutputProps) {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [showListingModal, setShowListingModal] = useState(false);

  if (loading) {
    return null;
  }

  if (message?.isLoading) {
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

  // Only show no results message if we have a response but no results
  if (message?.response && (!message.response.results || message.response.results.length === 0)) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No results found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  // Don't render anything if we don't have a response yet
  if (!message?.response) {
    return null;
  }

  const results = message.response.results;

  return (
    <div className="space-y-4">
      {results.map((car) => (
        <div
          key={car.listing_id}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">
                {car.year} {car.make} {car.model}
              </h3>
              <p className="text-gray-600">
                {car.price ? `€${car.price.toLocaleString()}` : 'Price on request'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {car.location}
                {car.seller && ` • ${car.seller}`}
              </p>
              {car.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {car.description}
                </p>
              )}
            </div>
            {car.url && (
              <Link
                href={car.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                View Listing
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

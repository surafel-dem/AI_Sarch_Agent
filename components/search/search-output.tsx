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
  if (message?.response && !message.response.results?.length) {
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

  return (
    <div className="flex flex-col space-y-4">
      {message.response.results.map((car, index) => (
        <div 
          key={index} 
          className="group hover:bg-gray-50 rounded-lg p-4 transition-all duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-medium text-gray-900">
                {car.make} {car.model} {car.model_variant}
              </h3>
              <div className="mt-1 text-gray-600">
                <span>{car.year}</span>
                <span className="mx-2">•</span>
                <span>{car.location}</span>
              </div>
              <p className="mt-2 text-gray-600">
                {car.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                €{typeof car.price_amount === 'number' ? car.price_amount.toLocaleString() : 'Price on request'}
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                setSelectedCar(car);
                setShowListingModal(true);
              }}
              className="bg-transparent text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors"
            >
              View Details
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      ))}

      {/* Listing Modal */}
      {showListingModal && selectedCar?.url && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                External Listing
              </h2>
              <button 
                onClick={() => {
                  setShowListingModal(false);
                  setSelectedCar(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  {selectedCar.make} {selectedCar.model} {selectedCar.model_variant}
                </h3>
                <p className="text-gray-600">
                  This listing is hosted on an external website. Click below to view the full details.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <a
                  href={selectedCar.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent text-blue-500 hover:text-blue-600 px-6 py-3 rounded-lg border border-blue-200 hover:bg-blue-50/50 inline-flex items-center justify-center gap-2 transition-colors"
                >
                  Open in New Tab
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-500">
                  Note: You will be redirected to {new URL(selectedCar.url).hostname}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Car } from '@/types/search';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Heart, MessageCircle, ExternalLink, CalendarIcon, MapPinIcon, Gauge } from 'lucide-react';
import Image from 'next/image';

interface SearchResultsProps {
  results: Car[];
  onResultClick?: (car: Car) => void;
  onSaveClick?: (car: Car) => void;
  onAskAI?: (car: Car) => void;
}

export function SearchResults({ results, onResultClick, onSaveClick, onAskAI }: SearchResultsProps) {
  if (!results?.length) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="bg-white/5 backdrop-blur rounded-xl border border-gray-200/20 p-6">
          <p className="text-gray-500 text-center">No results found. Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Found {results.length} match{results.length !== 1 ? 'es' : ''}</h2>
      <div className="grid grid-cols-1 gap-4">
        {results.map((car) => (
          <div
            key={car.listing_id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex flex-row h-[200px]">
              {/* Image section */}
              <div className="relative w-[300px] h-full">
                <Image
                  src={`/cars/${car.make.toLowerCase()}-${car.model.toLowerCase()}.jpg`}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content section */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                {/* Top section with title and price */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    €{car.price.toLocaleString()}
                  </p>
                </div>

                {/* Car details */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2 text-green-500" />
                    <span>{car.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Gauge className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{car.mileage ? car.mileage.toLocaleString() : 'N/A'} miles</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onResultClick?.(car)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSaveClick?.(car)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAskAI?.(car)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Car } from '@/types/search';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Heart, MessageCircle, ExternalLink, CalendarIcon, MapPinIcon, SpeedometerIcon } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {results.map((car, index) => (
        <div key={car.listing_id || index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="relative h-48">
            <Image
              src={car.image_url || '/placeholder-car.jpg'}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover rounded-t-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onSaveClick?.(car);
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">{car.year} {car.make} {car.model}</h3>
            <p className="text-orange-600 font-medium mt-1">${car.price.toLocaleString()}</p>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2 text-orange-500" />
                <span>{car.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <SpeedometerIcon className="w-4 h-4 mr-2 text-orange-500" />
                <span>{car.mileage.toLocaleString()} miles</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              {car.features?.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs text-gray-700 hover:text-blue-600 h-8"
                onClick={() => onResultClick?.(car)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs text-gray-700 hover:text-blue-600 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAI?.(car);
                }}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Ask AI
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

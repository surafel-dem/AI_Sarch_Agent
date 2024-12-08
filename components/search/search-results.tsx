import { Car } from '@/types/search';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Heart, MessageCircle, ExternalLink } from 'lucide-react';

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
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((car, index) => (
          <div
            key={car.listing_id || index}
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            {/* Image Gallery */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 flex items-center justify-center">
              <CarIcon className="h-8 w-8 text-gray-400" />
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

            {/* Car Info */}
            <div className="p-3 space-y-2">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {car.year} {car.make} {car.model}
                </h3>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-semibold text-blue-600">
                    €{car.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {car.location}
                  </span>
                </div>
              </div>

              {/* Description - only show if it exists */}
              {car.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {car.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
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
    </div>
  );
}

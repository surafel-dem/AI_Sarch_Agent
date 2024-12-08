import { Car, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Car as CarType } from '@/types/car';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: CarType[];
  onResultClick?: (car: CarType) => void;
  onSaveClick?: (car: CarType) => void;
  onAskAI?: (car: CarType) => void;
}

export function SearchResults({ results, onResultClick, onSaveClick, onAskAI }: SearchResultsProps) {
  if (!results?.length) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl border border-gray-200/20 p-6">
          <p className="text-muted-foreground text-center">No results found. Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* Results Header */}
      <div className="bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl border border-gray-200/20 p-4">
        <h2 className="text-lg font-medium text-foreground">
          Found {results.length} matches
        </h2>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((car, index) => (
          <div
            key={index}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {/* Image Gallery */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
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
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {car.year} {car.make} {car.model}
                  </h3>
                  {car.listing_status && (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                      {car.listing_status}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold text-blue-600">
                    €{car.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-medium">Trans:</span>
                  {car.transmission || 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-medium">Fuel:</span>
                  {car.details?.fuel_type || 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-medium">Body:</span>
                  {car.details?.body_type || 'N/A'}
                </div>
              </div>

              {/* Location */}
              <div className="text-sm text-gray-500">
                {car.location}
              </div>

              {/* Description */}
              {car.description && (
                <div className="text-sm text-gray-600 line-clamp-2">
                  {car.description}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => onResultClick?.(car)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskAI?.(car);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
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

'use client';

import { Car } from '@/types/car';

interface SearchResultsProps {
  results: Car[];
  onResultClick?: (car: Car) => void;
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  if (!results?.length) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border border-white/10 p-6">
          <p className="text-muted-foreground text-center">No results found. Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
      {/* Results Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border border-white/10 p-4">
        <h2 className="text-lg font-medium text-foreground">
          Found {results.length} matches
        </h2>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((car, index) => (
          <div
            key={index}
            onClick={() => onResultClick?.(car)}
            className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border border-white/10 p-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-foreground font-medium">
                  {car.year} {car.make} {car.model}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {car.price ? `€${car.price.toLocaleString()}` : 'Price on request'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {car.mileage ? `${car.mileage.toLocaleString()} km` : 'New'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {car.location}
                  </span>
                </div>
              </div>
              
              {/* Features Tags */}
              <div className="flex gap-2">
                {car.features?.slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-3 text-sm text-muted-foreground">
              <p>{car.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

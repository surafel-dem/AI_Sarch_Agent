'use client';

interface SearchDividerProps {
  filters: {
    location?: string;
    make?: string;
    model?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    minYear?: string | number;
    maxYear?: string | number;
  };
  timestamp?: number;
}

export function SearchDivider({ filters, timestamp }: SearchDividerProps) {
  // Format all selected values into a concise string
  const formatSelectedValues = () => {
    const parts = [];
    
    // Add make and model if present
    if (filters.make || filters.model) {
      const carName = [filters.make, filters.model].filter(Boolean).join(' ');
      if (carName) parts.push(carName);
    }

    // Add location if present
    if (filters.location) {
      parts.push(filters.location);
    }

    // Add price range if present
    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice && filters.maxPrice) {
        parts.push(`€${filters.minPrice}-${filters.maxPrice}`);
      } else if (filters.minPrice) {
        parts.push(`€${filters.minPrice}+`);
      } else if (filters.maxPrice) {
        parts.push(`Up to €${filters.maxPrice}`);
      }
    }

    // Add year range if present
    if (filters.minYear || filters.maxYear) {
      if (filters.minYear && filters.maxYear) {
        parts.push(`${filters.minYear}-${filters.maxYear}`);
      } else if (filters.minYear) {
        parts.push(`${filters.minYear}+`);
      } else if (filters.maxYear) {
        parts.push(`Until ${filters.maxYear}`);
      }
    }

    // For debugging
    console.log('Filters:', filters);
    console.log('Formatted parts:', parts);

    return parts.length > 0 ? parts.join(' • ') : 'Recent Searches';
  };

  // Format timestamp
  const formatTime = () => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });
  };

  return (
    <div className="my-6">
      <div className="border-t border-gray-200 pt-4" />
      <div className="flex items-center justify-between px-2">
        <div className="flex h-7 items-center rounded-full bg-blue-100 px-3 text-sm font-medium text-blue-600">
          {formatSelectedValues()}
        </div>
        <div className="text-xs text-gray-400">
          {formatTime()}
        </div>
      </div>
    </div>
  );
}

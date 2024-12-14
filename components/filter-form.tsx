'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FilterFormProps {
  onSearch: (filters: {
    location?: string;
    make?: string;
    model?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
  }) => void;
  isLoading?: boolean;
}

export function FilterForm({ onSearch, isLoading }: FilterFormProps) {
  const [filters, setFilters] = useState({
    location: '',
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <Select
          value={filters.location}
          onValueChange={(value) => setFilters({ ...filters, location: value })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dublin" className="text-sm">Dublin</SelectItem>
            <SelectItem value="cork" className="text-sm">Cork</SelectItem>
            <SelectItem value="galway" className="text-sm">Galway</SelectItem>
            <SelectItem value="limerick" className="text-sm">Limerick</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.make}
          onValueChange={(value) => setFilters({ ...filters, make: value })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toyota" className="text-sm">Toyota</SelectItem>
            <SelectItem value="volkswagen" className="text-sm">Volkswagen</SelectItem>
            <SelectItem value="bmw" className="text-sm">BMW</SelectItem>
            <SelectItem value="audi" className="text-sm">Audi</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.model}
          onValueChange={(value) => setFilters({ ...filters, model: value })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corolla" className="text-sm">Corolla</SelectItem>
            <SelectItem value="golf" className="text-sm">Golf</SelectItem>
            <SelectItem value="3-series" className="text-sm">3 Series</SelectItem>
            <SelectItem value="a4" className="text-sm">A4</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-8 text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Searching...</span>
            </div>
          ) : (
            'Search'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Input
          type="number"
          placeholder="Min Price"
          className="h-8 text-sm"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Max Price"
          className="h-8 text-sm"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Min Year"
          className="h-8 text-sm"
          value={filters.minYear}
          onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Max Year"
          className="h-8 text-sm"
          value={filters.maxYear}
          onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
        />
      </div>
    </form>
  );
}

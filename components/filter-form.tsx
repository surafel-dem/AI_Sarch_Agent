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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <Select
        value={filters.location}
        onValueChange={(value) => setFilters({ ...filters, location: value })}
      >
        <SelectTrigger className="w-[100px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          <SelectItem value="dublin">Dublin</SelectItem>
          <SelectItem value="cork">Cork</SelectItem>
          <SelectItem value="galway">Galway</SelectItem>
          <SelectItem value="limerick">Limerick</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.make}
        onValueChange={(value) => setFilters({ ...filters, make: value })}
      >
        <SelectTrigger className="w-[90px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300">
          <SelectValue placeholder="Make" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          <SelectItem value="toyota">Toyota</SelectItem>
          <SelectItem value="volkswagen">VW</SelectItem>
          <SelectItem value="bmw">BMW</SelectItem>
          <SelectItem value="audi">Audi</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.model}
        onValueChange={(value) => setFilters({ ...filters, model: value })}
        disabled={!filters.make}
      >
        <SelectTrigger className="w-[90px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          <SelectItem value="corolla">Corolla</SelectItem>
          <SelectItem value="golf">Golf</SelectItem>
          <SelectItem value="3-series">3 Series</SelectItem>
          <SelectItem value="a4">A4</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder="Min €"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="w-[80px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
        <Input
          type="number"
          placeholder="Max €"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="w-[80px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
      </div>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder="Min Yr"
          value={filters.minYear}
          onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
          className="w-[70px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
        <Input
          type="number"
          placeholder="Max Yr"
          value={filters.maxYear}
          onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
          className="w-[70px] h-9 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-[#0066FF] hover:bg-[#0052CC] text-white h-9 px-4 rounded-lg ml-auto text-sm"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>...</span>
          </div>
        ) : (
          'Search'
        )}
      </Button>
    </form>
  );
}

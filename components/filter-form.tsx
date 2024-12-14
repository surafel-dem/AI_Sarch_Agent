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
        <SelectTrigger className="w-[100px] h-9 text-sm bg-white text-gray-900 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300">
          <SelectValue placeholder="Location" className="placeholder:text-gray-500" />
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
        <SelectTrigger className="w-[90px] h-9 text-sm bg-white text-gray-900 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300">
          <SelectValue placeholder="Make" className="placeholder:text-gray-500" />
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
        <SelectTrigger className="w-[90px] h-9 text-sm bg-white text-gray-900 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300">
          <SelectValue placeholder="Model" className="placeholder:text-gray-500" />
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
          className="w-[80px] h-9 text-sm bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
        <Input
          type="number"
          placeholder="Max €"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="w-[80px] h-9 text-sm bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
      </div>

      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder="Min Year"
          value={filters.minYear}
          onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
          className="w-[90px] h-9 text-sm bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
        <Input
          type="number"
          placeholder="Max Year"
          value={filters.maxYear}
          onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
          className="w-[90px] h-9 text-sm bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 hover:border-gray-300 focus:ring-0 focus:border-gray-300"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg transition-colors"
      >
        Search
      </Button>
    </form>
  );
}

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
}

export function FilterForm({ onSearch }: FilterFormProps) {
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full relative bg-black/5 backdrop-blur-xl rounded-[20px] border border-white/20 px-4 py-3">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
      <div className="absolute inset-y-0 -left-px w-px bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
      <div className="absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />

      <Select
        value={filters.location}
        onValueChange={(value) => setFilters({ ...filters, location: value })}
      >
        <SelectTrigger className="w-[100px]" variant="default">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent variant="default">
          <SelectItem value="dublin" variant="default">Dublin</SelectItem>
          <SelectItem value="cork" variant="default">Cork</SelectItem>
          <SelectItem value="galway" variant="default">Galway</SelectItem>
          <SelectItem value="limerick" variant="default">Limerick</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.make}
        onValueChange={(value) => setFilters({ ...filters, make: value })}
      >
        <SelectTrigger className="w-[90px]" variant="default">
          <SelectValue placeholder="Make" />
        </SelectTrigger>
        <SelectContent variant="default">
          <SelectItem value="toyota" variant="default">Toyota</SelectItem>
          <SelectItem value="volkswagen" variant="default">VW</SelectItem>
          <SelectItem value="bmw" variant="default">BMW</SelectItem>
          <SelectItem value="audi" variant="default">Audi</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.model}
        onValueChange={(value) => setFilters({ ...filters, model: value })}
        disabled={!filters.make}
      >
        <SelectTrigger className="w-[90px]" variant="default">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent variant="default">
          <SelectItem value="corolla" variant="default">Corolla</SelectItem>
          <SelectItem value="golf" variant="default">Golf</SelectItem>
          <SelectItem value="3-series" variant="default">3 Series</SelectItem>
          <SelectItem value="a4" variant="default">A4</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Select
          value={filters.minPrice}
          onValueChange={(value) => setFilters({ ...filters, minPrice: value })}
        >
          <SelectTrigger className="w-[100px]" variant="default">
            <SelectValue placeholder="Min €" />
          </SelectTrigger>
          <SelectContent variant="default">
            {[5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000].map((price) => (
              <SelectItem key={price} value={price.toString()} variant="default">
                €{price.toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.maxPrice}
          onValueChange={(value) => setFilters({ ...filters, maxPrice: value })}
        >
          <SelectTrigger className="w-[100px]" variant="default">
            <SelectValue placeholder="Max €" />
          </SelectTrigger>
          <SelectContent variant="default">
            {[10000, 20000, 30000, 40000, 50000, 75000, 100000].map((price) => (
              <SelectItem key={price} value={price.toString()} variant="default">
                €{price.toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Select
          value={filters.minYear}
          onValueChange={(value) => setFilters({ ...filters, minYear: value })}
        >
          <SelectTrigger className="w-[90px]" variant="default">
            <SelectValue placeholder="Min Year" />
          </SelectTrigger>
          <SelectContent variant="default">
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i).map((year) => (
              <SelectItem key={year} value={year.toString()} variant="default">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.maxYear}
          onValueChange={(value) => setFilters({ ...filters, maxYear: value })}
        >
          <SelectTrigger className="w-[90px]" variant="default">
            <SelectValue placeholder="Max Year" />
          </SelectTrigger>
          <SelectContent variant="default">
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i).map((year) => (
              <SelectItem key={year} value={year.toString()} variant="default">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        className="h-9 bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-200"
      >
        Search
      </Button>
    </form>
  );
}

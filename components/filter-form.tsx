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
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={filters.location}
          onValueChange={(value) => setFilters({ ...filters, location: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toyota">Toyota</SelectItem>
            <SelectItem value="volkswagen">Volkswagen</SelectItem>
            <SelectItem value="bmw">BMW</SelectItem>
            <SelectItem value="audi">Audi</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.model}
          onValueChange={(value) => setFilters({ ...filters, model: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corolla">Corolla</SelectItem>
            <SelectItem value="golf">Golf</SelectItem>
            <SelectItem value="3-series">3 Series</SelectItem>
            <SelectItem value="a4">A4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="grid grid-cols-4 gap-2 flex-1">
          <Input
            type="number"
            placeholder="Min €"
            className="h-9"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max €"
            className="h-9"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Min Year"
            className="h-9"
            value={filters.minYear}
            onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max Year"
            className="h-9"
            value={filters.maxYear}
            onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
          />
        </div>
        <Button type="submit" size="sm" className="h-9" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Apply'}
        </Button>
      </div>
    </form>
  );
}

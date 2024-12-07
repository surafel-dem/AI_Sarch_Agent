import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface SearchParamsProps {
  selections: Record<string, any>;
  onEdit?: () => void;
  onSearchResults?: (results: any) => void;
}

export function SearchParams({ selections, onEdit, onSearchResults }: SearchParamsProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    console.log('1. Search started with selections:', selections);
    setIsSearching(true);
    setError(null);

    try {
      // Format chatInput with all selected values from the summary cards
      const chatInputParts = [];

      // Vehicle Details
      if (selections.make) chatInputParts.push(selections.make);
      if (selections.model) chatInputParts.push(selections.model);
      if (selections.location) chatInputParts.push(selections.location);
      if (selections.year) chatInputParts.push(selections.year);
      if (selections.transmission) chatInputParts.push(selections.transmission);
      if (selections.fuelType) chatInputParts.push(selections.fuelType);

      // Price Range
      if (selections.minPrice) chatInputParts.push(`€${selections.minPrice}`);
      if (selections.maxPrice) chatInputParts.push(`€${selections.maxPrice}`);

      // Priorities
      if (selections.priorities && selections.priorities.length > 0) {
        chatInputParts.push(...selections.priorities);
      }

      // Must Have Features
      if (selections.mustHaveFeatures && selections.mustHaveFeatures.length > 0) {
        chatInputParts.push(...selections.mustHaveFeatures);
      }

      // Usage
      if (selections.usage) chatInputParts.push(selections.usage);

      // Custom Feature
      if (selections.customFeature) chatInputParts.push(selections.customFeature);

      const payload = {
        sessionId: uuidv4(),
        chatInput: chatInputParts.join(', '),
        carSpecs: {
          make: selections.make || '',
          model: selections.model || '',
          year: selections.year || '',
          county: selections.location || '',
          minPrice: selections.minPrice || '',
          maxPrice: selections.maxPrice || '',
        }
      };

      console.log('2. Sending payload to webhook:', payload);

      const response = await fetch('https://n8n.yotor.co/webhook/invoke_agent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('3. Webhook response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      console.log('4. Webhook response data:', JSON.stringify(data, null, 2));

      // Handle response as a single object with output field
      if (data && data.output) {
        const results = {
          message: data.output,
          listings: data.listings || [],
          sources: data.sources || []
        };
        console.log('5. Formatted results:', JSON.stringify(results, null, 2));
        onSearchResults?.(results);
      } else {
        console.log('6. Invalid response format:', data);
        setError('No results found');
      }
    } catch (error) {
      console.error('7. Search error:', error);
      setError('Failed to fetch search results');
    } finally {
      setIsSearching(false);
    }
  };

  const groupedSelections = {
    vehicle: {
      title: "Vehicle Details",
      items: [
        { key: "location", label: "Location" },
        { key: "make", label: "Make" },
        { key: "model", label: "Model" },
        { key: "year", label: "Year" },
        { key: "transmission", label: "Transmission" },
        { key: "fuelType", label: "Fuel Type" },
      ],
    },
    price: {
      title: "Price Range",
      items: [
        { key: "minPrice", label: "Min Price", prefix: "€" },
        { key: "maxPrice", label: "Max Price", prefix: "€" },
      ],
    },
    priorities: {
      title: "Priorities",
      items: [
        { key: "priorities", label: "Priorities", isArray: true },
      ],
    },
    mustHave: {
      title: "Must Have Features",
      items: [
        { key: "mustHaveFeatures", label: "Features", isArray: true },
      ],
    },
    additional: {
      title: "Additional Requirements",
      items: [
        { key: "usage", label: "Usage" },
        { key: "customFeature", label: "Custom Feature" },
      ],
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 place-items-start">
        {Object.entries(groupedSelections).map(([group, config]) => {
          const hasValues = config.items.some((item) => {
            const value = selections[item.key];
            if (item.isArray) {
              return Array.isArray(value) && value.length > 0;
            }
            return value && value !== "";
          });

          if (!hasValues) return null;

          return (
            <Card key={group} className="p-2.5 bg-white shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="mb-2">
                <h3 className="text-xs font-medium text-gray-700">{config.title}</h3>
              </div>
              <div className="space-y-1.5 min-w-[200px]">
                {config.items.map((item) => {
                  const value = selections[item.key];
                  if (!value || (typeof value === "string" && value === "")) return null;
                  
                  if (item.isArray && Array.isArray(value)) {
                    return (
                      <div key={item.key} className="flex flex-wrap gap-1">
                        {value.map((v, index) => (
                          <Badge
                            key={`${item.key}-${index}`}
                            variant="secondary"
                            className="bg-gray-50 text-gray-600 text-[10px] px-1.5 py-0.5 hover:bg-gray-100"
                          >
                            {v}
                          </Badge>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div key={item.key} className="text-[11px] text-gray-600">
                      <span className="font-medium">{item.label}:</span>{' '}
                      <span>{item.prefix || ''}{value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
        onClick={handleSearch}
        disabled={isSearching}
      >
        {isSearching ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            Searching...
          </>
        ) : (
          'Search Cars'
        )}
      </Button>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

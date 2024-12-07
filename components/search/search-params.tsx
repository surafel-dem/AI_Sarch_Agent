import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/card";

interface SearchParamsProps {
  selections: Record<string, any>;
  onEdit?: () => void;
}

export function SearchParams({ selections, onEdit }: SearchParamsProps) {
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
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 place-items-start">
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
            <Card key={group} className="p-2 bg-white shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="mb-1">
                <h3 className="text-xs font-medium text-gray-700">{config.title}</h3>
              </div>
              <div className="space-y-1 min-w-[200px]">
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
        variant="outline" 
        onClick={onEdit}
        className="w-full sm:w-auto text-xs py-1"
      >
        Edit Filters
      </Button>
    </div>
  );
}

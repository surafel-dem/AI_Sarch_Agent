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
    <div className="relative">
      {onEdit && (
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 bg-white border-gray-200"
        >
          Edit
        </Button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
            <Card key={group} className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">{config.title}</h3>
              </div>
              <div className="space-y-2">
                {config.items.map((item) => {
                  const value = selections[item.key];
                  if (!value || (typeof value === "string" && value === "")) return null;
                  
                  if (item.isArray && Array.isArray(value)) {
                    return (
                      <div key={item.key} className="flex flex-wrap gap-1.5">
                        {value.map((v, index) => (
                          <Badge
                            key={`${item.key}-${index}`}
                            variant="secondary"
                            className="bg-gray-50 text-gray-600 text-xs px-2 py-1 hover:bg-gray-100"
                          >
                            {v}
                          </Badge>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div key={item.key} className="text-sm text-gray-600">
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
    </div>
  );
}

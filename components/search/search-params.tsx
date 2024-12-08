import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { SearchSelections } from '@/types/search';
import { Badge } from "@/components/ui/badge";

interface SearchParamsProps {
  selections: SearchSelections;
}

export function SearchParams({ selections }: SearchParamsProps) {
  const router = useRouter();

  const selectionGroups = {
    vehicle: ['make', 'model', 'year', 'vehicle_type'],
    price: ['price_range', 'budget', 'price_min', 'price_max'],
    location: ['location', 'distance'],
    features: ['features', 'must_have_features', 'safety_features'],
    preferences: ['fuel_efficiency', 'performance', 'comfort', 'style']
  };

  const getGroupValues = (fields: string[]) => {
    return fields.flatMap(field => {
      const value = selections[field as keyof SearchSelections];
      if (!value || (Array.isArray(value) && value.length === 0)) return [];
      return Array.isArray(value) ? value : [value];
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 py-2">
      <div className="max-w-3xl mx-auto px-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1">
          {Object.entries(selectionGroups).map(([group, fields]) => {
            const values = getGroupValues(fields);
            if (values.length === 0) return null;

            return (
              <div key={group} className="flex items-center gap-1.5 shrink-0">
                {values.map((value, index) => (
                  <Badge
                    key={`${group}-${index}`}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm whitespace-nowrap"
                  >
                    {value}
                  </Badge>
                ))}
                <div className="w-px h-4 bg-gray-200 last:hidden" />
              </div>
            );
          })}
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors shrink-0"
        >
          <PencilSquareIcon className="w-4 h-4" />
          <span className="sr-only">Edit preferences</span>
        </button>
      </div>
    </div>
  );
}

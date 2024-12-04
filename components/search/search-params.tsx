import { X } from 'lucide-react';

interface SearchParamsProps {
  specs: Record<string, string | string[]>;
}

export function SearchParams({ specs }: SearchParamsProps) {
  // Filter and format parameters for display
  const displayParams = Object.entries(specs).reduce((acc, [key, value]) => {
    // Skip empty values, session ID, and chat input
    if (!value || key === 'sessionId' || key === 'chatInput') return acc;

    // Handle array values (like features)
    if (Array.isArray(value)) {
      if (value.length > 0) {
        acc.push(value.join(', '));
      }
      return acc;
    }

    // Add the raw value
    acc.push(value.toString());
    return acc;
  }, [] as string[]);

  if (displayParams.length === 0) return null;

  return (
    <div className="bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {displayParams.map((value, index) => (
            <div
              key={index}
              className="px-3 py-1 rounded-full text-sm
                        bg-gray-700 text-gray-200 shadow-sm
                        border border-gray-600/50"
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

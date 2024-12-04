'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Source {
  name: string;
  logo: string;
}

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <div className="space-y-4">
      {/* Source Summary */}
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          {sources.slice(0, 3).map((source, i) => (
            <div
              key={source.name}
              className="relative w-8 h-8 rounded-full ring-2 ring-gray-900 overflow-hidden"
              style={{ zIndex: 3 - i }}
            >
              <Image
                src={source.logo}
                alt={source.name}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-400">{sources.length} sources</span>
      </div>

      {/* Source Grid */}
      <div className="grid grid-cols-2 gap-2">
        {sources.map((source) => (
          <div
            key={source.name}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={source.logo}
                  alt={source.name}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {source.name}
              </span>
            </div>
            <ExternalLink size={16} className="text-gray-500 group-hover:text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Page() {
  return (
    <SourceList
      sources={[
        { name: "BMW Dublin", logo: "https://placehold.co/100x100/808080/FFF?text=BMW" },
        { name: "CarZone", logo: "https://placehold.co/100x100/808080/FFF?text=CZ" },
        { name: "AutoTrader", logo: "https://placehold.co/100x100/808080/FFF?text=AT" },
        { name: "DoneDeal", logo: "https://placehold.co/100x100/808080/FFF?text=DD" },
      ]}
    />
  );
}

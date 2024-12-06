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
        <div className="flex -space-x-1.5">
          {sources.slice(0, 3).map((source, i) => (
            <div
              key={source.name}
              className="relative w-6 h-6 rounded-full ring-1 ring-white/10 overflow-hidden"
              style={{ zIndex: 3 - i }}
            >
              <Image
                src={source.logo}
                alt={source.name}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground/80">{sources.length} sources</span>
      </div>

      {/* Source Grid */}
      <div className="grid grid-cols-2 gap-2">
        {sources.map((source) => (
          <div
            key={source.name}
            className="flex items-center space-x-2.5 p-2 rounded-md bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-colors group"
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={source.logo}
                alt={source.name}
                width={20}
                height={20}
                className="object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {source.name}
            </span>
            <ExternalLink size={16} className="text-muted-foreground group-hover:text-foreground" />
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

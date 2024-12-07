'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchParams } from '@/components/search/search-params';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface WebhookResponse {
  message: string;
  listings: {
    title: string;
    price: number;
    year: number;
    location: string;
    url: string;
  }[];
  sources: {
    title: string;
    url: string;
  }[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selections = searchParams.get('selections') 
    ? JSON.parse(searchParams.get('selections')!) 
    : {};

  const [searchResults, setSearchResults] = useState<WebhookResponse | null>(null);

  const handleSearchResults = (results: WebhookResponse) => {
    console.log('Received search results in page:', JSON.stringify(results, null, 2));
    setSearchResults(results);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <SearchParams 
          selections={selections}
          onEdit={() => router.push('/')}
          onSearchResults={handleSearchResults}
        />
      </div>
      
      {searchResults && (
        <div className="mt-6 space-y-6">
          {/* AI Response */}
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="prose max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                  ),
                  p: ({ node, ...props }) => <p {...props} className="mb-4" />,
                  strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />,
                }}
              >
                {searchResults.message}
              </ReactMarkdown>
            </div>
          </div>

          {/* Car Listings */}
          {searchResults.listings && searchResults.listings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Cars</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.listings.map((listing, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2">{listing.title}</h3>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-blue-600">€{listing.price.toLocaleString()}</p>
                      <p className="text-gray-600 text-sm">
                        <span className="inline-block mr-2">{listing.year}</span>•
                        <span className="inline-block mx-2">{listing.location}</span>
                      </p>
                      <a 
                        href={listing.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {searchResults.sources && searchResults.sources.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Sources</h2>
              <ul className="list-disc list-inside">
                {searchResults.sources.map((source, index) => (
                  <li key={index}>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

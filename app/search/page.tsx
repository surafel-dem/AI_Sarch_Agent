'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchParams } from '@/components/search/search-params';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatMessage } from '@/types/search';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchResults = (results: WebhookResponse) => {
    console.log('Received search results in page:', JSON.stringify(results, null, 2));
    setMessages([{
      role: 'assistant',
      content: results.message,
      timestamp: Date.now(),
      listings: results.listings,
      sources: results.sources
    }]);
    setSearchResults(results);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col min-h-full">
          {/* Search Params - Always Visible */}
          <div className="sticky top-0 z-10 bg-white pb-1 border-b">
            <SearchParams 
              selections={selections}
              onEdit={() => router.push('/')}
            />
            
            {/* Loading State - Immediately Below Search Params */}
            {isLoading && (
              <div className="py-1 flex justify-center">
                <div className="animate-bounce space-x-1 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Search Results - Start Right Below Search Params */}
          <div className="flex-1 flex flex-col">
            {searchResults && (
              <div className="flex-1 flex flex-col pt-1 pb-24">
                {/* AI Response */}
                <div className="prose max-w-none [&>p:last-child]:mb-0">
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                      ),
                      p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />,
                      strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />,
                    }}
                  >
                    {searchResults.message}
                  </ReactMarkdown>
                </div>

                {/* Push the chat interface to the bottom when there are no listings */}
                {(!searchResults.listings?.length && !searchResults.sources?.length) && (
                  <div className="flex-1" />
                )}

                {/* Listings Section */}
                {searchResults.listings?.length > 0 && (
                  <div className="mt-3 space-y-2">
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

                {/* Sources Section */}
                {searchResults.sources?.length > 0 && (
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
        </div>
      </div>

      {/* Fixed Chat Interface at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInterface
            initialSpecs={selections}
            messages={messages}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

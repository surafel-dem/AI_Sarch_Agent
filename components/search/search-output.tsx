import { SearchResponse } from '@/types/search';
import { SearchResults } from './search-results';
import ReactMarkdown from 'react-markdown';

interface SearchOutputProps {
  response: SearchResponse;
}

export function SearchOutput({ response }: SearchOutputProps) {
  if (response.type === 'car_listing') {
    if (!response.results?.length) {
      return (
        <div className="bg-white/5 backdrop-blur rounded-xl border border-gray-200/20 p-6">
          <p className="text-gray-700">No matching cars found. Try adjusting your search criteria.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white/5 backdrop-blur rounded-xl border border-gray-200/20 p-4">
          <h2 className="text-lg font-medium text-gray-900">
            Found {response.matches} {response.matches === 1 ? 'match' : 'matches'}
          </h2>
        </div>
        <SearchResults results={response.results} />
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-xl border border-gray-200/20 p-6">
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown>{response.content}</ReactMarkdown>
      </div>
    </div>
  );
}

'use client';

import { Search, Sparkles } from 'lucide-react';

export function SearchHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-500 dark:text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Ask anything..."
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg pl-11 pr-20 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <div className="absolute right-3 flex items-center">
            <span className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm px-2.5 py-1 rounded-md">
              <Sparkles size={14} />
              <span>Pro</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

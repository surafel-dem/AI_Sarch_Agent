'use client';

import { useState } from 'react'
import { Send } from 'lucide-react'
import { invokeSearchAgent } from '@/lib/search-api'
import { v4 as uuidv4 } from 'uuid'

const options = [
  {
    label: 'Find Dealer',
    query: 'Help me find a dealer nearby',
    icon: '🔍'
  },
  {
    label: 'Car Prices',
    query: 'What are the current car prices?',
    icon: '🚗'
  },
  {
    label: 'Car Reviews',
    query: 'Show me recent car reviews',
    icon: '⭐'
  }
]

export function AIAssistant() {
  const [inputValue, setInputValue] = useState('')
  const sessionId = uuidv4()

  const handleOptionClick = async (query: string) => {
    try {
      const response = await invokeSearchAgent({
        sessionId,
        chatInput: query,
        carSpecs: {}
      });
      console.log('Search response:', response);
      // Update the input value after sending the query
      setInputValue(query);
    } catch (error) {
      console.error('Error sending suggestion query:', error);
    }
  }

  return (
    <div className="fixed bottom-4 right-4">
      <div className="w-[240px] bg-white rounded-[24px] shadow-2xl border border-gray-100">
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm mr-2">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <h2 className="text-sm font-medium text-gray-900">Assistant</h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-2 mb-3">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option.query)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors text-left text-xs"
              >
                <span>{option.icon}</span>
                <span className="text-gray-700">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="w-full pl-3 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

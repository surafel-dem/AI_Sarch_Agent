'use client';

import { useState } from 'react'
import { Send, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(true)
  const sessionId = uuidv4()

  const handleOptionClick = async (query: string) => {
    try {
      const response = await invokeSearchAgent({
        sessionId,
        chatInput: query,
        carSpecs: {}
      });
      console.log('Search response:', response);
      setInputValue(query);
    } catch (error) {
      console.error('Error sending suggestion query:', error);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Panel */}
      <div className={`${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'} transition-all duration-200 ease-in-out`}>
        <div className="w-[280px] bg-[#1a1a1a]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 transition-all duration-200">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#27272a] border border-white/10 flex items-center justify-center shadow-lg mr-3">
                <span className="text-white/90 text-sm font-medium">AI</span>
              </div>
              <h2 className="text-base font-medium text-white/80">AI Assistant</h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-2.5 mb-4">
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleOptionClick(option.query)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#27272a]/50 hover:bg-[#27272a]/80 transition-all duration-200 text-left border border-white/10 hover:border-white/20"
                >
                  <span className="text-white/60 group-hover:text-white/80 transition-colors">
                    {option.icon}
                  </span>
                  <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                    {option.label}
                  </span>
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
                className="w-full pl-4 pr-12 py-3 text-sm bg-[#27272a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 text-white/80 placeholder:text-white/40 transition-all duration-200"
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Icon */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'translate-y-0' : '-translate-y-2'} cursor-pointer w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center transition-transform duration-200 hover:scale-105 shadow-lg backdrop-blur-sm`}
      >
        <div className="w-full h-full bg-[#27272a]/80 rounded-2xl flex items-center justify-center border border-white/10">
          <span className="text-white/90 text-lg font-medium tracking-wide">AI</span>
        </div>
      </div>
    </div>
  );
}

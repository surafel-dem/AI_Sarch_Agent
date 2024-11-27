'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Send, Home, PlusCircle, Clock, ChevronLeft, Menu, X, Car } from 'lucide-react'
import { ArrowRight, Search, Zap, Brain, ThumbsUp, Info } from "lucide-react"
import { NavBar } from './nav-bar'
import { nanoid } from 'nanoid'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/context/auth-context'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Message {
  id: number
  type: 'text' | 'markdown' | 'filter_selection'
  content: string
  sender: 'user' | 'bot'
}

interface CarSpecs {
  make: string
  model: string
  year: string
  county: string
  minPrice: string
  maxPrice: string
}

export interface Car {
  id: string
  make: string
  model: string
  year: string
  price: string
  location: string
  dealerStatus: string
  description: string
  url?: string
}

interface LoadingState {
  isLoading: boolean
  dots: number
  showThinking: boolean
}

const websites = [
  { name: 'AutoTrader', url: 'https://www.autotrader.ie' },
  { name: 'Cars.com', url: 'https://www.cars.com' },
  { name: 'CarGurus', url: 'https://www.cargurus.com' },
  { name: 'Edmunds', url: 'https://www.edmunds.com' }
]

// Car makes and their corresponding models
const carMakes = {
  Audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7'],
  BMW: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', 'X1', 'X3', 'X5'],
  Mercedes: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'GLE'],
  Volkswagen: ['Golf', 'Passat', 'Polo', 'Tiguan', 'T-Roc', 'ID.3', 'ID.4'],
  Toyota: ['Corolla', 'Camry', 'RAV4', 'CHR', 'Yaris', 'Land Cruiser'],
  Honda: ['Civic', 'CR-V', 'HR-V', 'Jazz', 'e'],
  Ford: ['Focus', 'Fiesta', 'Kuga', 'Puma', 'Mustang'],
  Hyundai: ['i20', 'i30', 'Tucson', 'Kona', 'Santa Fe'],
  Kia: ['Ceed', 'Sportage', 'Niro', 'EV6', 'Sorento'],
  Nissan: ['Qashqai', 'Juke', 'Leaf', 'X-Trail', 'Micra']
};

export function CarSearchAi() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [carSpecs, setCarSpecs] = useState<CarSpecs>({
    make: '',
    model: '',
    year: '',
    county: '',
    minPrice: '',
    maxPrice: ''
  })
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState(() => nanoid())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Car[]>([])
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    dots: 0,
    showThinking: false
  })
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const handleSearchResults = useCallback((results: Car[]) => {
    setSearchResults(results)
    if (results.length > 0) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'markdown',
        content: 'Here are your search results:',
        sender: 'bot'
      }])
    }
  }, [])

  const invokeAgent = async (text: string, fullText: string) => {
    try {
      setIsSearching(true)
      const response = await fetch('https://n8n.yotor.co/webhook/invoke_agent', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          chatInput: fullText,
          resetContext: false // Don't reset context within the same session
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Full response data:', data)

      if (data && data.output) {
        let outputContent = data.output;
        
        // If output is an object, convert it to string
        if (typeof outputContent === 'object') {
          outputContent = JSON.stringify(outputContent, null, 2);
        }
        
        return outputContent;
      }

      throw new Error('Unexpected response format')
    } catch (error) {
      handleError(error)
      return "Sorry, there was an error processing your request."
    } finally {
      setIsSearching(false)
    }
  }

  const processMessage = useCallback((content: any): Message => {
    // For all responses, return as markdown
    return {
      id: Date.now(),
      type: 'markdown',
      content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      sender: 'bot'
    };
  }, []);

  const handleSearch = async () => {
    if (!inputMessage.trim()) return;
    
    // Set chat started immediately
    setChatStarted(true);
    
    setLoadingState({
      isLoading: true,
      dots: 0,
      showThinking: false
    });
    setErrorMessage('');
    
    const messageText = inputMessage.trim();
    setInputMessage(''); // Clear input immediately after getting the value
    
    try {
      // Add user message first
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'text',
        content: messageText,
        sender: 'user'
      }]);

      // Get full text with filters
      const fullText = `${messageText}`.trim();
      const aiResponse = await invokeAgent(messageText, fullText);
      
      // Process and add bot response
      const processedMessage = processMessage(aiResponse);
      setMessages(prev => [...prev, processedMessage]);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      handleSearch()
    }
  }

  // Filter open effect
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFilterOpen])

  // Search state effect
  useEffect(() => {
    if (isSearching) {
      setLoadingState(prev => ({ ...prev, isLoading: true }))
    }
    return () => {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }, [isSearching])

  // Message scroll effect
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Add resize effect for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const updateCarSpecs = (key: keyof CarSpecs, value: string) => {
    setCarSpecs(prev => {
      const updatedSpecs = { ...prev, [key]: value };
      const anySelected = Object.values(updatedSpecs).some(spec => spec !== '');
      setIsFilterApplied(anySelected);
      
      // If make is changed, reset model
      if (key === 'make') {
        updatedSpecs.model = '';
        // Update available models
        const models = carMakes[value as keyof typeof carMakes] || [];
        setAvailableModels(models);
      }
      
      return updatedSpecs;
    });
  }

  const handleFilterReset = () => {
    setCarSpecs({
      make: '',
      model: '',
      year: '',
      county: '',
      minPrice: '',
      maxPrice: ''
    });
    setIsFilterApplied(false);
    setAvailableModels([]);
  }

  const handleFilterApply = async () => {
    if (!isFiltersApplied) return; // Don't proceed if no filters are applied
    
    setLoadingState({
      isLoading: true,
      dots: 0,
      showThinking: false
    });
    setErrorMessage('');
    
    const filterMessage = getFilterString();
    
    try {
      // Set chat started before adding messages
      setChatStarted(true);
      
      // Add filter selection badges in a clean format
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'filter_selection',
        content: filterMessage,
        sender: 'user'
      }]);

      const aiResponse = await invokeAgent('', filterMessage);
      const processedMessage = processMessage(aiResponse);
      setMessages(prev => [...prev, processedMessage]);
      
      // Close filter dialog after successful response
      setIsFilterOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetChat = useCallback(() => {
    // Clear all messages
    setMessages([]);
    setInputMessage('');
    
    // Reset all specifications
    setCarSpecs({
      make: '',
      model: '',
      year: '',
      county: '',
      minPrice: '',
      maxPrice: ''
    });
    
    // Reset all states
    setIsFilterApplied(false);
    setChatStarted(false);
    setSearchResults([]);
    setAvailableModels([]);
    setErrorMessage('');
    
    // Generate new session ID for completely fresh start
    const newSessionId = nanoid();
    setSessionId(newSessionId);
    
    // Initial webhook call to reset context
    fetch('https://n8n.yotor.co/webhook/invoke_agent', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: newSessionId,
        chatInput: "",
        resetContext: true
      })
    }).catch(error => console.error('Error resetting context:', error));
  }, []);

  const handleNewChat = () => {
    resetChat();
  };

  const handleHomeClick = () => {
    resetChat();
  };

  const getFilterString = () => {
    const filters = []
    if (carSpecs.make) filters.push(`Make: ${carSpecs.make}`)
    if (carSpecs.model) filters.push(`Model: ${carSpecs.model}`)
    if (carSpecs.year) filters.push(`Year: ${carSpecs.year}`)
    if (carSpecs.county) filters.push(`Location: ${carSpecs.county}`)
    if (carSpecs.minPrice) filters.push(`Min Price: €${carSpecs.minPrice}`)
    if (carSpecs.maxPrice) filters.push(`Max Price: €${carSpecs.maxPrice}`)
    return filters.join(', ')
  }

  const FilterBadges = ({ filters }: { filters: string }) => {
    const badges = filters.split(', ').map((filter, index) => (
      <span
        key={index}
        className="inline-flex items-center px-3 py-1.5 mr-2 mb-2 text-sm font-medium rounded-lg 
                 bg-purple-50 text-purple-800 border border-purple-100"
      >
        {filter}
      </span>
    ));

    return (
      <div className="flex flex-wrap items-center">
        <span className="mr-2 text-sm text-gray-500">Selected Filters:</span>
        {badges}
      </div>
    );
  };

  const MessageBubble = ({ content, sender }: { content: string, sender: 'user' | 'bot' }) => (
    <div className={`${
      sender === 'user'
        ? 'text-[#8A2BE2] ml-auto'
        : 'bg-gray-50 rounded-lg px-4 py-3'
    }`}>
      <p className="text-sm leading-relaxed text-current">
        {content}
      </p>
    </div>
  );

  // Filter state management
  const isFiltersApplied = React.useMemo(() => 
    Object.values(carSpecs).some(value => value !== ''),
    [carSpecs]
  );

  const renderFilterBadges = useCallback(() => {
    const badges = []
    if (carSpecs.make) badges.push({ key: 'make', value: carSpecs.make })
    if (carSpecs.model) badges.push({ key: 'model', value: carSpecs.model })
    if (carSpecs.year) badges.push({ key: 'year', value: carSpecs.year })
    if (carSpecs.county) badges.push({ key: 'county', value: carSpecs.county })
    if (carSpecs.minPrice) badges.push({ key: 'minPrice', value: carSpecs.minPrice })
    if (carSpecs.maxPrice) badges.push({ key: 'maxPrice', value: carSpecs.maxPrice })

    return badges.map(badge => (
      <Button
        key={badge.key}
        variant="outline"
        size="sm"
        className="bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors duration-200 rounded-lg px-3 py-1 text-xs flex items-center mr-2 mb-2 h-6"
        onClick={() => updateCarSpecs(badge.key as keyof CarSpecs, '')}
      >
        {badge.value}
        <X className="h-3 w-3 ml-2" />
      </Button>
    ))
  }, [carSpecs]);

  // Monitor active filters
  useEffect(() => {
    if (isFiltersApplied) {
      const badges = renderFilterBadges()
      console.debug('Active filters:', badges.length)
    }
  }, [carSpecs, isFiltersApplied, renderFilterBadges]);

  // Loading state management
  useEffect(() => {
    let thinkingTimeout: NodeJS.Timeout
    
    if (loadingState.isLoading) {
      thinkingTimeout = setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          showThinking: true
        }))
      }, 2000)
    }

    return () => {
      clearTimeout(thinkingTimeout)
    }
  }, [loadingState.isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loadingState.isLoading) {
      interval = setInterval(() => {
        setLoadingState(prev => ({
          ...prev,
          dots: (prev.dots + 1) % 4
        }))
      }, 300)
    }
    return () => clearInterval(interval)
  }, [loadingState.isLoading]);

  // Chat scroll management
  useEffect(() => {
    if (chatContainerRef.current && chatStarted) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, chatStarted]);

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const container = chatContainerRef.current;
      const lastMessage = container.lastElementChild as HTMLElement;
      
      if (lastMessage) {
        try {
          const scrollPosition = lastMessage.getBoundingClientRect().top 
            - container.getBoundingClientRect().top 
            - container.clientHeight 
            + lastMessage.clientHeight 
            + 200; // 200px buffer
          
          container.scrollTo({
            top: container.scrollTop + scrollPosition,
            behavior: 'smooth'
          });
        } catch (error) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  }, [messages, loadingState.isLoading]);

  // UI state management
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleError = (error: any) => {
    const errorMsg = error.message || 'An error occurred'
    setErrorMessage(errorMsg)
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      type: 'text',
      content: errorMsg,
      sender: 'bot'
    }])
  }

  const MessageRenderer = ({ message }: { message: Message }) => {
    switch (message.type) {
      case 'text':
        return <MessageBubble content={message.content as string} sender={message.sender} />;
      
      case 'filter_selection':
        return (
          <div className="px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
            <FilterBadges filters={message.content as string} />
          </div>
        );
      
      case 'markdown':
        return (
          <div className={`prose max-w-none ${
            message.sender === 'user' ? 'text-white' : 'text-gray-800'
          }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-4 text-gray-700">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8A2BE2] hover:text-[#7B1FA2] underline"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-4 text-sm text-gray-700">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="mb-2">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-gray-800">{children}</em>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-semibold mb-4 text-gray-900">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-medium mb-3 text-gray-800">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium mb-2 text-gray-800">{children}</h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-6 h-6 text-[#8A2BE2]" />
            <span className="text-xl font-semibold text-gray-900">CarSearchAI</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-600 hover:text-[#8A2BE2] transition-colors duration-200"
            >
              Home
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-600 hover:text-[#8A2BE2] transition-colors duration-200"
            >
              How It Works
            </button>
            <button
              onClick={() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-600 hover:text-[#8A2BE2] transition-colors duration-200"
            >
              About Us
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 z-50 flex flex-col items-center py-4 space-y-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-700 hover:text-[#8A2BE2] hover:bg-gray-50 transition-colors duration-200"
          onClick={handleHomeClick}
        >
          <Home className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-700 hover:text-[#8A2BE2] hover:bg-gray-50 transition-colors duration-200"
          onClick={handleNewChat}
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <NavBar onReset={resetChat} />

      {/* Main Content */}
      <div className="flex-1 pt-16 pl-16">
        <div className="h-full overflow-y-auto scrollbar-gutter-stable">
          <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${chatStarted ? 'items-start bg-gray-50' : ''}`}>
            {!chatStarted ? (
              // Hero Section with Filter Box and Chat Box
              <div className="flex flex-col">
                {/* Hero Section with Filter Box - Full Height Landing */}
                <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50/30">
                  <div className="text-center max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-900">
                      Find Your Perfect Car
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                      Set your preferences and let our AI assistant help you find the perfect car
                    </p>

                    {/* Filter Box */}
                    <div className="w-full max-w-[460px] mx-auto mb-16">
                      <div className="bg-white shadow-lg rounded-lg border border-purple-100 p-6 shadow-purple-50/50">
                        {/* Grid Layout */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Make Selection */}
                          <Select onValueChange={(value) => {
                            updateCarSpecs('make', value);
                            setAvailableModels(carMakes[value as keyof typeof carMakes] || []);
                            updateCarSpecs('model', '');
                          }}>
                            <SelectTrigger 
                              className="w-full bg-gray-50 text-gray-900 h-11
                              border border-purple-100 rounded-lg
                              transition-all duration-200 hover:border-[#8A2BE2]
                              focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                              text-[14px] font-medium px-3"
                            >
                              <SelectValue placeholder="Make" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-white border-gray-200
                              text-gray-900 rounded-lg overflow-hidden shadow-lg"
                            >
                              {Object.keys(carMakes).map((make) => (
                                <SelectItem 
                                  key={make}
                                  value={make}
                                  className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                                  hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                                >
                                  {make}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Model Selection */}
                          <Select 
                            onValueChange={(value) => updateCarSpecs('model', value)}
                            disabled={!carSpecs.make}
                          >
                            <SelectTrigger 
                              className="w-full bg-gray-50 text-gray-900 h-11
                              border border-purple-100 rounded-lg
                              transition-all duration-200 hover:border-[#8A2BE2]
                              focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                              text-[14px] font-medium px-3
                              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <SelectValue placeholder="Model" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-white border-gray-200
                              text-gray-900 rounded-lg overflow-hidden shadow-lg"
                            >
                              {availableModels.map((model) => (
                                <SelectItem 
                                  key={model}
                                  value={model}
                                  className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                                  hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                                >
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Year Selection */}
                          <Select onValueChange={(value) => updateCarSpecs('year', value)}>
                            <SelectTrigger 
                              className="w-full bg-gray-50 text-gray-900 h-11
                              border border-purple-100 rounded-lg
                              transition-all duration-200 hover:border-[#8A2BE2]
                              focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                              text-[14px] font-medium px-3"
                            >
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-white border-gray-200
                              text-gray-900 rounded-lg overflow-hidden shadow-lg"
                            >
                              {[2024, 2023, 2022, 2021].map((year) => (
                                <SelectItem 
                                  key={year}
                                  value={year.toString()}
                                  className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                                  hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                                >
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* County Selection */}
                          <Select onValueChange={(value) => updateCarSpecs('county', value)}>
                            <SelectTrigger 
                              className="w-full bg-gray-50 text-gray-900 h-11
                              border border-purple-100 rounded-lg
                              transition-all duration-200 hover:border-[#8A2BE2]
                              focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                              text-[14px] font-medium px-3"
                            >
                              <SelectValue placeholder="County" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-white border-gray-200 text-gray-900 rounded-lg overflow-hidden shadow-lg"
                              style={{ maxHeight: '300px', overflowY: 'auto' }}
                            >
                              <SelectGroup>
                                <SelectLabel className="px-3 py-2 text-xs text-gray-500">All Ireland</SelectLabel>
                                <SelectItem 
                                  value="all" 
                                  className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                                >
                                  All Counties
                                </SelectItem>
                              </SelectGroup>

                              <SelectGroup>
                                <SelectLabel className="px-3 py-2 text-xs text-gray-500">Republic of Ireland</SelectLabel>
                                <SelectItem value="carlow" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Carlow</SelectItem>
                                <SelectItem value="cavan" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Cavan</SelectItem>
                                <SelectItem value="clare" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Clare</SelectItem>
                                <SelectItem value="cork" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Cork</SelectItem>
                                <SelectItem value="donegal" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Donegal</SelectItem>
                                <SelectItem value="dublin" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Dublin</SelectItem>
                                <SelectItem value="galway" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Galway</SelectItem>
                                <SelectItem value="kerry" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Kerry</SelectItem>
                                <SelectItem value="kildare" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Kildare</SelectItem>
                                <SelectItem value="kilkenny" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Kilkenny</SelectItem>
                                <SelectItem value="laois" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Laois</SelectItem>
                                <SelectItem value="leitrim" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Leitrim</SelectItem>
                                <SelectItem value="limerick" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Limerick</SelectItem>
                                <SelectItem value="longford" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Longford</SelectItem>
                                <SelectItem value="louth" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Louth</SelectItem>
                                <SelectItem value="mayo" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Mayo</SelectItem>
                                <SelectItem value="meath" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Meath</SelectItem>
                                <SelectItem value="monaghan" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Monaghan</SelectItem>
                                <SelectItem value="offaly" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Offaly</SelectItem>
                                <SelectItem value="roscommon" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Roscommon</SelectItem>
                                <SelectItem value="sligo" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Sligo</SelectItem>
                                <SelectItem value="tipperary" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Tipperary</SelectItem>
                                <SelectItem value="waterford" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Waterford</SelectItem>
                                <SelectItem value="westmeath" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Westmeath</SelectItem>
                                <SelectItem value="wexford" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Wexford</SelectItem>
                                <SelectItem value="wicklow" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Wicklow</SelectItem>
                              </SelectGroup>

                              <SelectGroup>
                                <SelectLabel className="px-3 py-2 text-xs text-gray-500">Northern Ireland</SelectLabel>
                                <SelectItem value="antrim" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Antrim</SelectItem>
                                <SelectItem value="armagh" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Armagh</SelectItem>
                                <SelectItem value="derry" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Derry</SelectItem>
                                <SelectItem value="down" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Down</SelectItem>
                                <SelectItem value="fermanagh" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Fermanagh</SelectItem>
                                <SelectItem value="tyrone" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Tyrone</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>

                          {/* Price Range Selection */}
                          <Select onValueChange={(value) => updateCarSpecs('minPrice', value)}>
                            <SelectTrigger 
                              className="w-full bg-gray-50 text-gray-900 h-11
                              border border-purple-100 rounded-lg
                              transition-all duration-200 hover:border-[#8A2BE2]
                              focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                              text-[14px] font-medium px-3"
                            >
                              <SelectValue placeholder="Min Price" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-white border-gray-200
                              text-gray-900 rounded-lg overflow-hidden shadow-lg"
                            >
                              <SelectItem 
                                value="0"
                                className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                              >
                                Any
                              </SelectItem>
                              {[5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000].map((price) => (
                                <SelectItem 
                                  key={price}
                                  value={price.toString()}
                                  className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                                >
                                  €{price.toLocaleString()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select onValueChange={(value) => updateCarSpecs('maxPrice', value)}>
                            <SelectTrigger 
                              className="w-full bg-gray-50 text-gray-900 h-11
                              border border-purple-100 rounded-lg
                              transition-all duration-200 hover:border-[#8A2BE2]
                              focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                              text-[14px] font-medium px-3"
                            >
                              <SelectValue placeholder="Max Price" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-white border-gray-200
                              text-gray-900 rounded-lg overflow-hidden shadow-lg"
                            >
                              <SelectItem 
                                value="999999"
                                className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                              >
                                Any
                              </SelectItem>
                              {[10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000].map((price) => (
                                <SelectItem 
                                  key={price}
                                  value={price.toString()}
                                  className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                                >
                                  €{price.toLocaleString()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Action Button */}
                        <div className="mt-6">
                          <Button
                            onClick={handleFilterApply}
                            disabled={!isFiltersApplied}
                            className={`w-full h-11 bg-[#8A2BE2] text-white text-sm font-medium
                              rounded-lg shadow-sm hover:bg-[#7B1FA2] transition-colors duration-200
                              disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-200
                              ${!isFiltersApplied ? 'opacity-50' : ''}`}
                          >
                            Apply Filter
                          </Button>
                        </div>
                      </div>
                      
                      {/* Chat Input Section */}
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Or chat with our AI Assistant</p>
                      </div>
                      
                      <form onSubmit={handleSendMessage} className="relative">
                        <div className="relative">
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="How can CarSearchAI help you today?"
                            className="w-full pl-4 pr-10 py-2 bg-[#8A2BE2] text-white text-sm border border-[#8A2BE2] rounded-lg
                            focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] placeholder-gray-200 shadow-md"
                            disabled={loadingState.isLoading}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={loadingState.isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent rounded-lg p-2 transition-all duration-200 hover:bg-[#7B1FA2]/20"
                          >
                            <Send className="h-5 w-5 text-white" />
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Websites We Search */}
                    <div className="w-full max-w-2xl mx-auto mt-16">
                      <p className="text-sm text-gray-500 mb-6">Websites We Search</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {websites.map((site) => (
                          <div key={site.name} className="flex flex-col items-center group">
                            <div className="relative w-12 h-12 mb-2 transform transition-transform duration-300 group-hover:scale-110">
                              <a href={site.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-lg font-bold text-gray-500">{site.name.charAt(0)}</span>
                                </div>
                              </a>
                            </div>
                            <span className="text-xs text-gray-600 group-hover:text-[#7B1FA2] transition-colors duration-200">
                              {site.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* How It Works Section - Full Height */}
                <section id="how-it-works" className="min-h-screen flex items-center justify-center bg-[#8A2BE2] py-24">
                  <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold mb-6 text-white">How It Works</h2>
                      <p className="text-white/90 max-w-2xl mx-auto text-lg">
                        Experience the future of car shopping with our AI-powered platform
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 relative">
                      {/* Connecting Line (Desktop) */}
                      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 transform -translate-y-1/2" />
                      
                      {/* Step 1 */}
                      <div className="group relative">
                        <div className="bg-white rounded-lg p-8 shadow-lg h-full transform transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-start space-x-6">
                            <div className="w-14 h-14 rounded-lg bg-[#8A2BE2] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <Search className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-semibold mb-4 text-gray-900">AI-Powered Search</h3>
                              <p className="text-gray-600 leading-relaxed">
                                Our AI agents continuously scrape multiple sources for the latest car listings, ensuring you have access to the most up-to-date information.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="group relative">
                        <div className="bg-white rounded-lg p-8 shadow-lg h-full transform transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-start space-x-6">
                            <div className="w-14 h-14 rounded-lg bg-[#8A2BE2] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <Brain className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Smart Filtering</h3>
                              <p className="text-gray-600 leading-relaxed">
                                Use our intuitive filters to narrow down your search, or simply chat with our AI assistant to find cars that match your specific criteria.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* About Us Section - Full Height */}
                <section id="about-us" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50/30 to-white py-24">
                  <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-lg p-12 shadow-xl border border-purple-100">
                      <h2 className="text-4xl font-bold mb-8 text-center text-gray-900">About Us</h2>
                      <div className="space-y-6 text-gray-600 max-w-3xl mx-auto">
                        <p className="leading-relaxed text-lg">
                          At CarSearchAI, we're revolutionizing the way people search for cars. Our cutting-edge AI technology is designed to provide the most efficient and personalized car search experience available.
                        </p>
                        <p className="leading-relaxed text-lg">
                          We understand that finding the perfect car can be a daunting task. That's why we've developed an intelligent system that not only searches through vast databases of car listings but also learns from your preferences to deliver tailored results.
                        </p>
                        <p className="leading-relaxed text-lg">
                          Our team consists of automotive enthusiasts, AI experts, and customer experience specialists, all working together to make your car search as smooth and effective as possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              // Chat Interface with Search Results
              <div className="w-full h-screen flex flex-col">
                {/* Messages and Results Container */}
                <div 
                  ref={chatContainerRef} 
                  className="flex-1 overflow-y-auto px-4 pt-20"
                >
                  <div className="max-w-4xl mx-auto space-y-6 pb-40">
                    {messages.map((message, index) => (
                      <div 
                        key={message.id} 
                        className={`message-container flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar - Only show for AI messages */}
                        {message.sender === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                            🤖
                          </div>
                        )}
                        
                        {/* Message Content */}
                        <div className={`${message.sender === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
                          <MessageRenderer message={message} />
                        </div>

                        {/* Avatar - Only show for user messages */}
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                            👤
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Loading State */}
                    {loadingState.isLoading && (
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mr-3">
                          🤖
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg rounded-bl-sm shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed Chat Input */}
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-50">
                  
                    <div className="p-4">
                      <div className="w-full max-w-[460px] mx-auto">
                        <form onSubmit={handleSendMessage} className="relative">
                          <div className="relative">
                            <Input
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              placeholder="Follow-up"
                              className="w-full pl-4 pr-10 py-2 bg-[#8A2BE2]/90 text-white text-sm border border-[#8A2BE2]/80 rounded-lg
                              focus:ring-2 focus:ring-[#8A2BE2]/40 focus:border-[#8A2BE2]/60 placeholder-gray-200/90 shadow-md"
                              disabled={loadingState.isLoading}
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={loadingState.isLoading}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent rounded-lg p-2 transition-all duration-200 hover:bg-[#7B1FA2]/20"
                            >
                              <Send className="h-5 w-5 text-white" />
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-white rounded-lg 
          border border-purple-100 shadow-lg p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#8A2BE2]" />
              Filter Cars
            </DialogTitle>
            <p className="text-gray-500 mt-2 text-sm">
              Set your preferences to find the perfect car
            </p>
          </DialogHeader>
          <div className="bg-white rounded-lg border-[1.5px] border-gray-200/70 p-6 hover:border-[#8A2BE2]/30 transition-colors duration-200">
            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Make Selection */}
              <Select onValueChange={(value) => {
                updateCarSpecs('make', value);
                setAvailableModels(carMakes[value as keyof typeof carMakes] || []);
                updateCarSpecs('model', '');
              }}>
                <SelectTrigger 
                  className="w-full bg-gray-50 text-gray-900 h-11
                  border border-purple-100 rounded-lg
                  transition-all duration-200 hover:border-[#8A2BE2]
                  focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                  text-[14px] font-medium px-3"
                >
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200
                  text-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {Object.keys(carMakes).map((make) => (
                    <SelectItem 
                      key={make}
                      value={make}
                      className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                      hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                    >
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Model Selection */}
              <Select 
                onValueChange={(value) => updateCarSpecs('model', value)}
                disabled={!carSpecs.make}
              >
                <SelectTrigger 
                  className="w-full bg-gray-50 text-gray-900 h-11
                  border border-purple-100 rounded-lg
                  transition-all duration-200 hover:border-[#8A2BE2]
                  focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                  text-[14px] font-medium px-3
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200
                  text-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {availableModels.map((model) => (
                    <SelectItem 
                      key={model}
                      value={model}
                      className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                      hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                    >
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Selection */}
              <Select onValueChange={(value) => updateCarSpecs('year', value)}>
                <SelectTrigger 
                  className="w-full bg-gray-50 text-gray-900 h-11
                  border border-purple-100 rounded-lg
                  transition-all duration-200 hover:border-[#8A2BE2]
                  focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                  text-[14px] font-medium px-3"
                >
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200
                  text-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {[2024, 2023, 2022, 2021].map((year) => (
                    <SelectItem 
                      key={year}
                      value={year.toString()}
                      className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                      hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* County Selection */}
              <Select onValueChange={(value) => updateCarSpecs('county', value)}>
                <SelectTrigger 
                  className="w-full bg-gray-50 text-gray-900 h-11
                  border border-purple-100 rounded-lg
                  transition-all duration-200 hover:border-[#8A2BE2]
                  focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                  text-[14px] font-medium px-3"
                >
                  <SelectValue placeholder="County" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200 text-gray-900 rounded-lg overflow-hidden shadow-lg"
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  <SelectGroup>
                    <SelectLabel className="px-3 py-2 text-xs text-gray-500">All Ireland</SelectLabel>
                    <SelectItem 
                      value="all" 
                      className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                    >
                      All Counties
                    </SelectItem>
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="px-3 py-2 text-xs text-gray-500">Republic of Ireland</SelectLabel>
                    <SelectItem value="carlow" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Carlow</SelectItem>
                    <SelectItem value="cavan" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Cavan</SelectItem>
                    <SelectItem value="clare" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Clare</SelectItem>
                    <SelectItem value="cork" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Cork</SelectItem>
                    <SelectItem value="donegal" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Donegal</SelectItem>
                    <SelectItem value="dublin" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Dublin</SelectItem>
                    <SelectItem value="galway" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Galway</SelectItem>
                    <SelectItem value="kerry" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Kerry</SelectItem>
                    <SelectItem value="kildare" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Kildare</SelectItem>
                    <SelectItem value="kilkenny" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Kilkenny</SelectItem>
                    <SelectItem value="laois" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Laois</SelectItem>
                    <SelectItem value="leitrim" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Leitrim</SelectItem>
                    <SelectItem value="limerick" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Limerick</SelectItem>
                    <SelectItem value="longford" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Longford</SelectItem>
                    <SelectItem value="louth" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Louth</SelectItem>
                    <SelectItem value="mayo" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Mayo</SelectItem>
                    <SelectItem value="meath" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Meath</SelectItem>
                    <SelectItem value="monaghan" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Monaghan</SelectItem>
                    <SelectItem value="offaly" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Offaly</SelectItem>
                    <SelectItem value="roscommon" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Roscommon</SelectItem>
                    <SelectItem value="sligo" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Sligo</SelectItem>
                    <SelectItem value="tipperary" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Tipperary</SelectItem>
                    <SelectItem value="waterford" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Waterford</SelectItem>
                    <SelectItem value="westmeath" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Westmeath</SelectItem>
                    <SelectItem value="wexford" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Wexford</SelectItem>
                    <SelectItem value="wicklow" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Wicklow</SelectItem>
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="px-3 py-2 text-xs text-gray-500">Northern Ireland</SelectLabel>
                    <SelectItem value="antrim" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Antrim</SelectItem>
                    <SelectItem value="armagh" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Armagh</SelectItem>
                    <SelectItem value="derry" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Derry</SelectItem>
                    <SelectItem value="down" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Down</SelectItem>
                    <SelectItem value="fermanagh" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Fermanagh</SelectItem>
                    <SelectItem value="tyrone" className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]">Tyrone</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Price Range Selection */}
              <Select onValueChange={(value) => updateCarSpecs('minPrice', value)}>
                <SelectTrigger 
                  className="w-full bg-gray-50 text-gray-900 h-11
                  border border-purple-100 rounded-lg
                  transition-all duration-200 hover:border-[#8A2BE2]
                  focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                  text-[14px] font-medium px-3"
                >
                  <SelectValue placeholder="Min Price" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200
                  text-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  <SelectItem 
                    value="0"
                    className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                  >
                    Any
                  </SelectItem>
                  {[5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000].map((price) => (
                    <SelectItem 
                      key={price}
                      value={price.toString()}
                      className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                    >
                      €{price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => updateCarSpecs('maxPrice', value)}>
                <SelectTrigger 
                  className="w-full bg-gray-50 text-gray-900 h-11
                  border border-purple-100 rounded-lg
                  transition-all duration-200 hover:border-[#8A2BE2]
                  focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20
                  text-[14px] font-medium px-3"
                >
                  <SelectValue placeholder="Max Price" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200
                  text-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  <SelectItem 
                    value="999999"
                    className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                  >
                    Any
                  </SelectItem>
                  {[10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000].map((price) => (
                    <SelectItem 
                      key={price}
                      value={price.toString()}
                      className="hover:bg-[#8A2BE2] hover:bg-opacity-10 hover:text-[#8A2BE2]"
                    >
                      €{price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <Button
                onClick={handleFilterApply}
                disabled={!isFiltersApplied}
                className={`w-full h-11 bg-[#8A2BE2] text-white text-sm font-medium
                  rounded-lg shadow-sm hover:bg-[#7B1FA2] transition-colors duration-200
                  disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-200
                  ${!isFiltersApplied ? 'opacity-50' : ''}`}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
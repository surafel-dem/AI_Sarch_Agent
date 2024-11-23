'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Removed Image import if not used
// import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Send, Home, PlusCircle, Clock, ChevronLeft, Menu, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import { MessageBubble } from './messages/MessageBubble'
import { MarkdownMessage } from './messages/MarkdownMessage'
import { CarListingMessage } from './messages/CarListingMessage'
import Image from 'next/image'


import { ArrowRight, Search, Zap, Brain, ThumbsUp, Info } from "lucide-react"
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Message {
  id: number
  type: 'text' | 'markdown' | 'car_listing'
  content: string
  sender: 'user' | 'bot'
  searchResults?: Car[]
  isLoading?: boolean
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
  imageUrl: string
}

interface LoadingState {
  isLoading: boolean
  dots: number
  showThinking: boolean
}

interface CarListingContent {
  listings: Car[];
}

const websites = [
  { name: 'AutoTrader', logo: '/logos/carsie.png' },
  { name: 'Cars.com', logo: '/logos/carsie.png' },
  { name: 'CarGurus', logo: '/logos/carsie.png' },
  { name: 'Edmunds', logo: '/logos/carsie.png' },
  { name: 'KBB', logo: '/logos/carsie.png' },
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
        type: 'car_listing',
        content: 'Here are your search results:',
        sender: 'bot',
        searchResults: results
      }])
    }
  }, [])
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

  const parseCarResults = useCallback((response: string): Car[] => {
    const cars: Car[] = []
    const carBlocks = response.split('\n\n')
    carBlocks.forEach((block, index) => {
      const blockLines = block.split('\n')
      if (blockLines.length >= 5) {
        cars.push({
          id: `car-${index}`,
          make: blockLines[0].split(' ')[0],
          model: blockLines[0].split(' ').slice(1).join(' '),
          year: blockLines[0].match(/\d{4}/)?.[0] || '',
          price: blockLines[1].split(': ')[1],
          location: blockLines[2].split(': ')[1],
          dealerStatus: blockLines[3].split(': ')[1],
          description: blockLines[4].split(': ')[1],
          imageUrl: `/placeholder.svg?height=200&width=300`,
        })
      }
    })

    handleSearchResults(cars)
    return cars
  }, [handleSearchResults])

  // Parse car results effect
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'markdown' && lastMessage.content.includes('car listings available')) {
        const results = parseCarResults(lastMessage.content)
        handleSearchResults(results)
      }
    }
  }, [messages, handleSearchResults])

  const isFiltersApplied = React.useMemo(() => 
    Object.values(carSpecs).some(value => value !== ''),
    [carSpecs]
  )

  // Ensure isFiltersApplied is declared before it's used
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
        className="bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors duration-200 rounded-full px-3 py-1 text-xs flex items-center mr-2 mb-2 h-6"
        onClick={() => updateCarSpecs(badge.key as keyof CarSpecs, '')}
      >
        {badge.value}
        <X className="h-3 w-3 ml-2" />
      </Button>
    ))
  }, [carSpecs])

  useEffect(() => {
    if (isFiltersApplied) {
      const badges = renderFilterBadges()
      console.debug('Active filters:', badges.length)
    }
  }, [carSpecs, isFiltersApplied, renderFilterBadges]) // Added dependencies

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
  }, [loadingState.isLoading])

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
  }, [loadingState.isLoading])

  useEffect(() => {
    if (chatContainerRef.current && chatStarted) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, chatStarted])

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const container = chatContainerRef.current;
      const lastMessage = container.lastElementChild as HTMLElement;
      
      if (lastMessage) {
        try {
          // Safely calculate scroll position
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
          // Fallback scroll to bottom if calculation fails
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  }, [messages, loadingState.isLoading]);

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
          carSpecs: carSpecs
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Full response data:', data)

      if (data && data.output) {
        if (typeof data.output === 'string') {
          return data.output
        } else if (typeof data.output === 'object') {
          return JSON.stringify(data.output, null, 2)
        }
      }

      throw new Error('Unexpected response format')
    } catch (error) {
      handleError(error)
      return "Sorry, there was an error processing your request."
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async () => {
    setLoadingState({
      isLoading: true,
      dots: 0,
      showThinking: false
    })
    setErrorMessage('')
    
    try {
      const fullText = `${inputMessage} ${getFilterString()}`.trim()
      const aiResponse = await invokeAgent(inputMessage, fullText)
      
      setMessages(prev => [...prev, {
        id: messages.length + 1,
        type: 'markdown',
        content: aiResponse,
        sender: 'bot'
      }])
      
      setChatStarted(true)
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      const fullText = `${inputMessage} ${getFilterString()}`.trim()
      setMessages(prevMessages => [...prevMessages, {
        id: messages.length + 1,
        type: 'text',
        content: inputMessage,
        sender: 'user'
      }])
      setInputMessage('')
      handleSearch()
      setChatStarted(true)
    }
  }

  const updateCarSpecs = (key: keyof CarSpecs, value: string) => {
    setCarSpecs(prev => {
      const updatedSpecs = { ...prev, [key]: value };
      const anySelected = Object.values(updatedSpecs).some(spec => spec !== '');
      setIsFilterApplied(anySelected);
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
    })
  }

  const handleFilterApply = async () => {
    setIsFilterOpen(false)
    setChatStarted(true)
    setLoadingState({
      isLoading: true,
      dots: 0,
      showThinking: false
    })
    
    const filterMessage = getFilterString()
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      type: 'text',
      content: `You Selected ${filterMessage}`,
      sender: 'user'
    }])
    
    try {
      const aiResponse = await invokeAgent('', filterMessage)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'markdown',
        content: aiResponse,
        sender: 'bot'
      }])
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const resetChat = () => {
    setMessages([])
    setInputMessage('')
    setChatStarted(false)
    handleFilterReset()
    setErrorMessage('')
    setSessionId(nanoid())
    setSearchResults([])
  }

  const getFilterString = () => {
    const filters = []
    if (carSpecs.make) filters.push(`Make: ${carSpecs.make}`)
    if (carSpecs.model) filters.push(`Model: ${carSpecs.model}`)
    if (carSpecs.year) filters.push(`Year: ${carSpecs.year}`)
    if (carSpecs.county) filters.push(`County: ${carSpecs.county}`)
    if (carSpecs.minPrice) filters.push(`Min Price: ${carSpecs.minPrice}`)
    if (carSpecs.maxPrice) filters.push(`Max Price: ${carSpecs.maxPrice}`)
    return filters.length > 0 ? `(Filters: ${filters.join(', ')})` : ''
  }

  const MessageRenderer = ({ message }: { message: Message }) => {
    // Helper function to check if content is car listing
    const isCarListing = (content: any): content is CarListingContent => {
      return typeof content === 'object' && 'listings' in content;
    };
  
    switch (message.type) {
      case 'text':
        return <MessageBubble content={message.content as string} sender={message.sender} />;
      
      case 'markdown':
        if (typeof message.content === 'string' && 
           (message.content.includes('car listings available') || 
            message.content.includes('[View Details]'))) {
          return <CarListingMessage content={message.content} />;
        }
        return <MarkdownMessage content={message.content as string} />;
      
      case 'car_listing':
        return (
          <>
            {typeof message.content === 'string' && (
              <MessageBubble content={message.content} sender={message.sender} />
            )}
            <CarListingMessage 
              content={isCarListing(message.content) ? message.content : message.content} 
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[rgb(0,7,36)] via-[rgb(0,14,72)] to-[rgb(0,21,108)] text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,50,150,0.3)] to-transparent pointer-events-none"></div>
      
      {/* Sidebar */}
      <div className="w-12 fixed left-0 top-0 h-screen z-50">
        <Button variant="ghost" size="icon" className="text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200" onClick={resetChat}>
          {chatStarted ? <ChevronLeft className="h-6 w-6" /> : <Home className="h-6 w-6" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200" onClick={resetChat}>
          <PlusCircle className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200">
          <Clock className="h-6 w-6" />
        </Button>
      </div>

      {/* Header - Increased z-index and adjusted positioning */}
      <header className="fixed top-0 left-12 right-0 bg-gradient-to-b from-[rgba(0,7,36,0.8)] to-[rgba(0,21,108,0.8)] 
        backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)] z-50">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-4 h-16">
          <h1 className="text-xl font-bold text-white">CarSearchAI</h1>
          <nav className="hidden md:flex items-center space-x-8 text-left">
            <a href="#how-it-works" className="text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200 flex items-center">
              <ArrowRight className="h-4 w-4 mr-1" />
              How It Works
            </a>
            <a href="#about-us" className="text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              About Us
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white
              h-10 rounded-full transition-all duration-300 text-[15px] font-medium
              hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
              active:scale-[0.98]">
                Sign Up
              </Button>
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="text-white md:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Main content - Adjusted padding and overflow */}
      <div className="flex-1 ml-12 pt-16"> {/* Changed pt-28 to pt-16 to match header height */}
        <div className="h-full overflow-y-auto scrollbar-gutter-stable">
          <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${chatStarted ? 'items-start' : ''}`}>
            {!chatStarted ? (
              // Hero Section with Filter Box and Chat Box
              <div className="text-center max-w-3xl mx-auto px-4 space-y-6 py-16 min-h-[calc(100vh-12rem)] flex flex-col justify-center">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 leading-tight text-white">
                  Saving You Time and Effort While {' '}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-transparent bg-clip-text">
                    Delivering The Best Matches
                  </span>
                </h1>
                <p className="text-sm md:text-base text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                  Select your preference and chat with our AI assistant
                </p>

                {/* Filter Box */}
                <div className="w-full max-w-[460px] mx-auto relative">
                  <div className="bg-[rgba(0,14,72,0.4)] backdrop-blur-sm p-4 rounded-2xl border border-[rgba(255,255,255,0.08)]">
                    {/* Grid Layout */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Make Selection */}
                      <Select onValueChange={(value) => {
                        updateCarSpecs('make', value);
                        setAvailableModels(carMakes[value as keyof typeof carMakes] || []);
                        // Reset model when make changes
                        updateCarSpecs('model', '');
                      }}>
                        <SelectTrigger 
                          className="w-full bg-[rgba(0,7,36,0.6)] text-gray-200 h-10
                          border border-[rgba(255,255,255,0.08)] rounded-xl
                          transition-all duration-200
                          focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]
                          text-[14px] font-light px-3"
                        >
                          <SelectValue placeholder="Make" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-[rgba(0,7,36,0.95)] border-[rgba(255,255,255,0.08)]
                          text-gray-200 rounded-xl overflow-hidden"
                        >
                          {Object.keys(carMakes).map((make) => (
                            <SelectItem 
                              key={make}
                              value={make}
                              className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                              hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
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
                          className="w-full bg-[rgba(0,7,36,0.6)] text-gray-200 h-10
                          border border-[rgba(255,255,255,0.08)] rounded-xl
                          transition-all duration-200
                          focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]
                          text-[14px] font-light px-3
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <SelectValue placeholder="Model" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-[rgba(0,7,36,0.95)] border-[rgba(255,255,255,0.08)]
                          text-gray-200 rounded-xl overflow-hidden"
                        >
                          {availableModels.map((model) => (
                            <SelectItem 
                              key={model}
                              value={model}
                              className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                              hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            >
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Year Selection */}
                      <Select onValueChange={(value) => updateCarSpecs('year', value)}>
                        <SelectTrigger 
                          className="w-full bg-[rgba(0,7,36,0.6)] text-gray-200 h-10
                          border border-[rgba(255,255,255,0.08)] rounded-xl
                          transition-all duration-200
                          focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]
                          text-[14px] font-light px-3"
                        >
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-[rgba(0,7,36,0.95)] border-[rgba(255,255,255,0.08)]
                          text-gray-200 rounded-xl overflow-hidden"
                        >
                          <SelectItem 
                            className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                            hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            value="2024"
                          >
                            2024
                          </SelectItem>
                          <SelectItem 
                            className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                            hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            value="2023"
                          >
                            2023
                          </SelectItem>
                          <SelectItem 
                            className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                            hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            value="2022"
                          >
                            2022
                          </SelectItem>
                          <SelectItem 
                            className="transition-colors duration-200 cursor-pointer py-2.5 px-4
                            hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            value="2021"
                          >
                            2021
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* County Selection */}
                      <Select onValueChange={(value) => updateCarSpecs('county', value)}>
                        <SelectTrigger 
                          className="w-full bg-[rgba(0,7,36,0.6)] text-gray-200 h-10
                          border border-[rgba(255,255,255,0.08)] rounded-xl
                          transition-all duration-200
                          focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]
                          text-[14px] font-light px-3"
                        >
                          <SelectValue placeholder="County" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-[rgba(0,7,36,0.95)] border-[rgba(255,255,255,0.08)] text-gray-200 rounded-xl overflow-hidden"
                          style={{ maxHeight: '300px', overflowY: 'auto' }}
                        >
                          <SelectGroup>
                            <SelectLabel className="px-3 py-2 text-xs text-gray-400">All Ireland</SelectLabel>
                            <SelectItem value="all" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">All Counties</SelectItem>
                          </SelectGroup>

                          <SelectGroup>
                            <SelectLabel className="px-3 py-2 text-xs text-gray-400">Republic of Ireland</SelectLabel>
                            <SelectItem value="carlow" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Carlow</SelectItem>
                            <SelectItem value="cavan" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Cavan</SelectItem>
                            <SelectItem value="clare" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Clare</SelectItem>
                            <SelectItem value="cork" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Cork</SelectItem>
                            <SelectItem value="donegal" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Donegal</SelectItem>
                            <SelectItem value="dublin" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Dublin</SelectItem>
                            <SelectItem value="galway" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Galway</SelectItem>
                            <SelectItem value="kerry" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Kerry</SelectItem>
                            <SelectItem value="kildare" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Kildare</SelectItem>
                            <SelectItem value="kilkenny" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Kilkenny</SelectItem>
                            <SelectItem value="laois" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Laois</SelectItem>
                            <SelectItem value="leitrim" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Leitrim</SelectItem>
                            <SelectItem value="limerick" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Limerick</SelectItem>
                            <SelectItem value="longford" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Longford</SelectItem>
                            <SelectItem value="louth" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Louth</SelectItem>
                            <SelectItem value="mayo" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Mayo</SelectItem>
                            <SelectItem value="meath" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Meath</SelectItem>
                            <SelectItem value="monaghan" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Monaghan</SelectItem>
                            <SelectItem value="offaly" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Offaly</SelectItem>
                            <SelectItem value="roscommon" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Roscommon</SelectItem>
                            <SelectItem value="sligo" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Sligo</SelectItem>
                            <SelectItem value="tipperary" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Tipperary</SelectItem>
                            <SelectItem value="waterford" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Waterford</SelectItem>
                            <SelectItem value="westmeath" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Westmeath</SelectItem>
                            <SelectItem value="wexford" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Wexford</SelectItem>
                            <SelectItem value="wicklow" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Wicklow</SelectItem>
                          </SelectGroup>

                          <SelectGroup>
                            <SelectLabel className="px-3 py-2 text-xs text-gray-400">Northern Ireland</SelectLabel>
                            <SelectItem value="antrim" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Antrim</SelectItem>
                            <SelectItem value="armagh" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Armagh</SelectItem>
                            <SelectItem value="derry" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Derry</SelectItem>
                            <SelectItem value="down" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Down</SelectItem>
                            <SelectItem value="fermanagh" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Fermanagh</SelectItem>
                            <SelectItem value="tyrone" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Tyrone</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {/* Price Range Selection */}
                      <Select onValueChange={(value) => updateCarSpecs('minPrice', value)}>
                        <SelectTrigger 
                          className="w-full bg-[rgba(0,7,36,0.6)] text-gray-200 h-10
                          border border-[rgba(255,255,255,0.08)] rounded-xl
                          transition-all duration-200
                          focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]
                          text-[14px] font-light px-3"
                        >
                          <SelectValue placeholder="Min Price" />
                        </SelectTrigger>
                        <SelectContent className="bg-[rgba(0,7,36,0.95)] border-[rgba(255,255,255,0.08)] text-gray-200 rounded-xl overflow-hidden">
                          <SelectItem value="0" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Any</SelectItem>
                          {[5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000].map((price) => (
                            <SelectItem 
                              key={price}
                              value={price.toString()}
                              className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            >
                              €{price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select onValueChange={(value) => updateCarSpecs('maxPrice', value)}>
                        <SelectTrigger 
                          className="w-full bg-[rgba(0,7,36,0.6)] text-gray-200 h-10
                          border border-[rgba(255,255,255,0.08)] rounded-xl
                          transition-all duration-200
                          focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]
                          text-[14px] font-light px-3"
                        >
                          <SelectValue placeholder="Max Price" />
                        </SelectTrigger>
                        <SelectContent className="bg-[rgba(0,7,36,0.95)] border-[rgba(255,255,255,0.08)] text-gray-200 rounded-xl overflow-hidden">
                          <SelectItem value="999999" className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent">Any</SelectItem>
                          {[10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000].map((price) => (
                            <SelectItem 
                              key={price}
                              value={price.toString()}
                              className="hover:text-[#8b5cf6] focus:text-[#8b5cf6] hover:bg-transparent focus:bg-transparent"
                            >
                              €{price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Action Button */}
                      <Button 
                        onClick={handleFilterApply}
                        disabled={!isFilterApplied}
                        className={`col-span-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white
                        h-10 rounded-xl transition-all duration-300 text-[14px] font-medium mt-2
                        ${!isFilterApplied ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98]'}`}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-sm md:text-base text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                  Or chat with our AI assistant
                </p>

                {/* Chat Input Box with Suggestions */}
                <div className="w-full max-w-[460px] mx-auto">
                  <form onSubmit={handleSendMessage} className="relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="How can CarSearchAI help you today?"
                      className="w-full pl-4 pr-10 py-2 bg-[#1a1a2e] text-gray-300 text-sm border border-gray-300 rounded-full
                      focus:ring-0 focus:border-gray-300 placeholder-gray-400 transition-none"
                      disabled={loadingState.isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={loadingState.isLoading}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full p-2 transition-all duration-200"
                    >
                      <Send className="h-5 w-5 text-[#8b5cf6] hover:text-white" />
                    </Button>
                  </form>
                </div>

                {/* Suggestions Section */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {[
                    "Find hybrid cars with automatic transmission",
                    "Show diesel vans for commercial use"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 bg-[rgba(0,7,36,0.6)] text-gray-200
                      hover:bg-[rgba(255,255,255,0.05)] rounded-full
                      border border-[rgba(255,255,255,0.08)]
                      transition-all duration-200 text-xs
                      hover:border-[rgba(255,255,255,0.15)]
                      hover:text-[#8b5cf6]"
                      onClick={() => {
                        setInputMessage(suggestion);
                        const textarea = document.querySelector('textarea');
                        textarea?.focus();
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>




                {/* Websites We Search section - Compact version */}
                <div className="w-full max-w-6xl mx-auto px-4 py-16 space-y-24">
      <section className="w-full py-12">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Websites We Search</h2>
        <p className="text-center text-gray-300 mb-10 max-w-2xl mx-auto">
          Here are some of the websites we search to find the best car listings for you.
        </p>
        <div className="flex justify-center items-center space-x-8 flex-wrap">
          {websites.map((site) => (
            <div key={site.name} className="group relative">
              <div className="w-8 h-8 flex items-center justify-center transition-all duration-300">
                <Image
                  src={site.logo}
                  alt={`${site.name} logo`}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <p className="text-[10px] text-gray-400 bg-[rgba(0,7,36,0.9)] px-2 py-1 rounded-md whitespace-nowrap border border-[rgba(255,255,255,0.08)]">
                  {site.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about-us" className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-2">About Us</h2>
        <div className="bg-[rgba(0,14,72,0.4)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] text-left">
          <p className="text-gray-300 mb-4">
            At CarSearchAI, we&apos;re revolutionizing the way people search for cars. Our cutting-edge AI technology is designed to provide the most efficient and personalized car search experience available.
          </p>
          <p className="text-gray-300 mb-4">
            We understand that finding the perfect car can be a daunting task. That&apos;s why we&apos;ve developed an intelligent system that not only searches through vast databases of car listings but also learns from your preferences to deliver tailored results.
          </p>
          <p className="text-gray-300">
            Our team consists of automotive enthusiasts, AI experts, and customer experience specialists, all working together to make your car search as smooth and effective as possible.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-2">How It Works</h2>
        <div className="bg-[rgba(0,14,72,0.4)] backdrop-blur-sm p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] text-left">
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] mr-3">
                <Search className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Search</h3>
                <p className="text-gray-300">Our AI agents continuously scrape multiple sources for the latest car listings, ensuring you have access to the most up-to-date information.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] mr-3">
                <Brain className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Filtering</h3>
                <p className="text-gray-300">Use our intuitive filters to narrow down your search, or simply chat with our AI assistant to find cars that match your specific criteria.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] mr-3">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalized Results</h3>
                <p className="text-gray-300">Our AI learns from your interactions and preferences, continuously improving the relevance of your search results over time.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] mr-3">
                <ThumbsUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Seamless Experience</h3>
                <p className="text-gray-300">From search to decision, our platform guides you through the entire process, providing valuable insights and answering your questions along the way.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>  

            
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
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            🤖
                          </div>
                        )}
                        
                        {/* Message Content */}
                        <div className={`${message.sender === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
                          <MessageRenderer message={message} />
                        </div>

                        {/* Avatar - Only show for user messages */}
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                            👤
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Loading State */}
                    {loadingState.isLoading && (
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mr-3">
                          🤖
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 bg-[#000435]/50 px-4 py-2 rounded-2xl rounded-bl-sm">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce"></div>
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
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Follow-up"
                            className="w-full pl-4 pr-10 py-2 bg-[#1a1a2e] text-gray-300 text-sm border border-gray-300 rounded-full
                            focus:ring-0 focus:border-gray-300 placeholder-gray-400 transition-none"
                            disabled={loadingState.isLoading}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={loadingState.isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full p-2 transition-all duration-200"
                          >
                            <Send className="h-5 w-5 text-[#8b5cf6] hover:text-white" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
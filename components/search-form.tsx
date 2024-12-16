"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { invokeSearchAgent } from '@/lib/search-api'
import { WebhookPayload, CarSpecs } from '@/types/search'
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";  
import debounce from 'lodash/debounce';

// Car makes and models data
const carModels = {
  volkswagen: [
    "Golf", "Passat", "Tiguan", "Polo", "ID.4", "T-Roc", "Arteon"
  ],
  toyota: [
    "Corolla", "RAV4", "Camry", "Yaris", "C-HR", "Land Cruiser", "Prius"
  ],
  hyundai: [
    "Tucson", "Kona", "i30", "Santa Fe", "i20", "IONIQ", "i10"
  ],
  ford: [
    "Focus", "Fiesta", "Puma", "Kuga", "Mondeo", "Mustang", "EcoSport"
  ],
  skoda: [
    "Octavia", "Kodiaq", "Superb", "Karoq", "Scala", "Kamiq", "Fabia"
  ],
  bmw: [
    "3 Series", "5 Series", "X5", "1 Series", "X3", "7 Series", "i4"
  ],
  audi: [
    "A4", "A6", "Q5", "A3", "Q3", "Q7", "e-tron"
  ],
  mercedes: [
    "C-Class", "E-Class", "A-Class", "GLC", "CLA", "GLA", "EQC"
  ],
  nissan: [
    "Qashqai", "Juke", "Leaf", "X-Trail", "Micra", "Ariya", "Navara"
  ],
  peugeot: [
    "3008", "2008", "208", "5008", "508", "e-208", "e-2008"
  ]
} as const;

type CarMake = keyof typeof carModels;

const locations = ["dublin", "cork", "galway", "limerick", "waterford", "belfast", "kilkenny"];
const makes = ["volkswagen", "toyota", "bmw", "audi", "mercedes"];
const models = ["Golf", "Passat", "Tiguan", "Polo", "ID.4", "T-Roc", "Arteon"];
const priceRanges = ["5000", "10000", "15000"];
const features = ["Fuel Efficiency" ,"Safety", "Performance", "Comfort", "Aesthetics"];
const priorities = ["Fuel Efficiency", "Safety", "Performance", "Comfort", "Aesthetics"];
const mustHaveFeatures = ["Electric/Hybrid", "All-Wheel Drive", "Luxury Features", "Advanced Technology"];

const usageOptions = ["Daily Commuting", "Long-Distance Travel", "Family Trips", "Adventure/Off-Road"];   

const yearRanges = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

export function SearchForm() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'priorities' | 'mustHave'>('priorities');
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    features: [] as string[],
    priorities: [] as string[],
    mustHaveFeatures: [] as string[],
    usage: "",
    location: "",
    customFeature: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type: 'priorities' | 'mustHave', value: string) => {
    const stateKey = type === 'mustHave' ? 'mustHaveFeatures' : 'priorities';
    setFormData(prev => ({
      ...prev,
      [stateKey]: prev[stateKey].includes(value)
        ? prev[stateKey].filter(item => item !== value)
        : [...prev[stateKey], value]
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Simplified validation - at least one field should have a value in step 1
  const isFormValid = () => {
    const step1Fields = [
      formData.location,
      formData.make,
      formData.model,
      formData.minPrice,
      formData.maxPrice,
      formData.minYear,
      formData.maxYear
    ];
    return step1Fields.some(value => Boolean(value));
  };

  const debouncedSubmit = useCallback(
    debounce(async (formData: FormData) => {
      setError('');
      if (!isFormValid()) {
        setError('Please make at least one selection in step 1 before searching.');
        return;
      }

      try {
        const sessionId = uuidv4();
        
        // Build search URL with parameters
        const searchParams = new URLSearchParams();
        
        // Add session and user IDs
        searchParams.append('sessionId', sessionId);
        if (user?.id) {
          searchParams.append('userId', user.id);
        }

        // Prepare webhook payload with only selected values
        const selectedValues = Object.entries(formData)
          .filter(([key, value]) => {
            if (!value) return false;
            if (Array.isArray(value)) return value.length > 0;
            return true;
          })
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, any>);

        // Create chat input from selected values
        const chatInput = Object.entries(selectedValues)
          .map(([key, value]) => {
            if (key === 'make') return `Make: ${value}`;
            if (key === 'model') return `Model: ${value}`;
            if (key === 'location') return `Location: ${value}`;
            if (key === 'minPrice') return `Min Price: €${value}`;
            if (key === 'maxPrice') return `Max Price: €${value}`;
            if (key === 'minYear') return `Min Year: ${value}`;
            if (key === 'maxYear') return `Max Year: ${value}`;
            if (key === 'features') return `Features: ${(value as string[]).join(', ')}`;
            if (key === 'usage') return `Usage: ${value}`;
            return '';
          })
          .filter(Boolean)
          .join(', ');

        // Add chatInput and all selected values to URL params
        searchParams.append('chatInput', chatInput);
        Object.entries(selectedValues).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        });

        // Navigate to search page with all parameters
        window.location.href = `/search?${searchParams.toString()}`;
      } catch (error) {
        console.error('Error during form submission:', error);
        setError('An error occurred while processing your request. Please try again.');
      }
    }, 500),
    [formData, user]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    debouncedSubmit(formData);
  };

  const nextStep = () => {
    setError(null);
    setAutoSubmitted(false);
    
    // Only validate step 1
    if (currentStep === 1 && !isFormValid()) {
      setError('Please make at least one selection before proceeding.');
      return;
    }
    
    // Steps 2 and 3 are optional, allow proceeding
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setAutoSubmitted(false);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step 
                  ? "bg-indigo-500 text-white ring-2 ring-indigo-200" 
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              )}>
                {step}
              </div>
              {step < 3 && (
                <div className="w-12 h-[1px] bg-indigo-200/30" />
              )}
            </div>
          ))}
        </div>

        {/* Glass box container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-5 shadow-lg">
          <div className="h-[240px] flex flex-col">
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white text-sm mb-1.5">Location</label>
                    <Select value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Select location" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {locations.map((location) => (
                          <SelectItem key={location} value={location} className="text-white hover:bg-indigo-500/20">
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1.5">Make</label>
                    <Select value={formData.make} onValueChange={(value) => handleSelectChange('make', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Select make" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {makes.map((make) => (
                          <SelectItem key={make} value={make} className="text-white hover:bg-indigo-500/20">
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1.5">Model</label>
                    <Select value={formData.model} onValueChange={(value) => handleSelectChange('model', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Select model" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {formData.make && carModels[formData.make as CarMake]?.map((model) => (
                          <SelectItem key={model} value={model} className="text-white hover:bg-indigo-500/20">
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-white text-sm mb-1.5">Min Price</label>
                    <Select value={formData.minPrice} onValueChange={(value) => handleSelectChange('minPrice', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Min" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {priceRanges.map((price) => (
                          <SelectItem key={price} value={price} className="text-white hover:bg-indigo-500/20">
                            €{price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1.5">Max Price</label>
                    <Select value={formData.maxPrice} onValueChange={(value) => handleSelectChange('maxPrice', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Max" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {priceRanges.map((price) => (
                          <SelectItem key={price} value={price} className="text-white hover:bg-indigo-500/20">
                            €{price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1.5">Min Year</label>
                    <Select value={formData.minYear} onValueChange={(value) => handleSelectChange('minYear', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Min" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {yearRanges.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-indigo-500/20">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1.5">Max Year</label>
                    <Select value={formData.maxYear} onValueChange={(value) => handleSelectChange('maxYear', value)}>
                      <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                        <SelectValue placeholder="Max" className="text-gray-300" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                        {yearRanges.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-indigo-500/20">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col h-full">
                <div className="flex space-x-1 border-b border-[#2D2D2D] justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('priorities')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors",
                      activeTab === 'priorities'
                        ? "bg-indigo-500/10 text-indigo-500 border-b-2 border-indigo-500"
                        : "bg-transparent text-gray-300 hover:text-indigo-500/70"
                    )}
                  >
                    Priorities
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mustHave')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors",
                      activeTab === 'mustHave'
                        ? "bg-indigo-500/10 text-indigo-500 border-b-2 border-indigo-500"
                        : "bg-transparent text-gray-300 hover:text-indigo-500/70"
                    )}
                  >
                    Must Have
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {activeTab === 'priorities' && priorities.map((priority) => (
                      <label key={priority} className="flex items-center space-x-1.5 text-xs">
                        <input
                          type="checkbox"
                          checked={formData.priorities.includes(priority)}
                          onChange={() => handleCheckboxChange('priorities', priority)}
                          className="h-3 w-3 rounded border-indigo-500/30 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <span className="text-gray-200">{priority}</span>
                      </label>
                    ))}
                    {activeTab === 'mustHave' && mustHaveFeatures.map((feature) => (
                      <label key={feature} className="flex items-center space-x-1.5 text-xs">
                        <input
                          type="checkbox"
                          checked={formData.mustHaveFeatures.includes(feature)}
                          onChange={() => handleCheckboxChange('mustHave', feature)}
                          className="h-3 w-3 rounded border-indigo-500/30 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <span className="text-gray-200">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-sm mb-1.5">Usage</label>
                  <Select value={formData.usage} onValueChange={(value) => handleSelectChange('usage', value)}>
                    <SelectTrigger className="w-full text-white h-9 bg-white/10 hover:bg-white/20 border border-white/20">
                      <SelectValue placeholder="Select usage" className="text-gray-300" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-white/10 text-white">
                      {usageOptions.map((option) => (
                        <SelectItem key={option} value={option} className="text-white hover:bg-indigo-500/20">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-white text-sm mb-1.5">Custom Feature</label>
                  <Input
                    type="text"
                    placeholder="Enter custom feature"
                    value={formData.customFeature}
                    onChange={(e) => setFormData(prev => ({ ...prev, customFeature: e.target.value }))}
                    className="h-9 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg shadow-sm text-white text-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-3 mt-3 border-t border-white/5">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="h-9 px-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => {
                if (currentStep === 3) {
                  router.push('/search?' + new URLSearchParams({
                    selections: JSON.stringify(formData)
                  }).toString());
                } else {
                  nextStep();
                }
              }}
              className="h-9 px-4 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
              disabled={!isFormValid()}
            >
              {currentStep === 3 ? (
                <>
                  Apply Filters
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

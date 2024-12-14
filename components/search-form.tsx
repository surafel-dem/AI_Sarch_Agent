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

// Styles for dropdowns
const selectTriggerStyles = "h-10 px-3 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] shadow-sm data-[placeholder]:text-gray-400 text-gray-200 text-sm relative [&>svg]:hidden hover:border-[#4A4A4A] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
const selectContentStyles = "bg-[#2A2A2A] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg shadow-md border border-[#3A3A3A] fixed"
const selectItemStyles = "py-2 px-3 text-sm text-gray-200 cursor-pointer data-[highlighted]:bg-[#3A3A3A] data-[highlighted]:text-gray-100"

const inputStyles = "h-10 px-3 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] shadow-sm text-gray-200 text-sm placeholder:text-gray-400 hover:border-[#4A4A4A] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"

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
    <div className="w-full">
      <div className="max-w-xl mx-auto bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-center items-center gap-2 mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep === num
                      ? "bg-[#6366f1] text-white"
                      : "bg-[#2A2A2A] text-gray-400"
                  )}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      num < currentStep ? "bg-[#6366f1]" : "bg-[#2A2A2A]"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form container */}
          <div className="relative h-[200px]">
            {/* Form content */}
            <div className="h-full">
              {currentStep === 1 && (
                <div className="space-y-4 flex flex-col items-center">
                  {/* First row: Location, Make, Model */}
                  <div className="flex justify-center gap-3 mb-4 w-full max-w-[600px]">
                    <Select name="location" onValueChange={(value) => handleSelectChange("location", value)}>
                      <SelectTrigger className={`w-[120px] ${selectTriggerStyles}`}>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location} className={selectItemStyles}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select name="make" onValueChange={(value) => handleSelectChange("make", value)}>
                      <SelectTrigger className={`w-[120px] ${selectTriggerStyles}`}>
                        <SelectValue placeholder="Make" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        {makes.map((make) => (
                          <SelectItem key={make} value={make} className={selectItemStyles}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      name="model"
                      onValueChange={(value) => handleSelectChange("model", value)}
                      disabled={!formData.make}
                    >
                      <SelectTrigger className={`w-[120px] ${selectTriggerStyles}`}>
                        <SelectValue placeholder="Model" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        {formData.make && carModels[formData.make as CarMake].map((model) => (
                          <SelectItem key={model} value={model} className={selectItemStyles}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Second row: Price and Year ranges */}
                  <div className="flex justify-center gap-6 w-full max-w-[600px]">
                    <div className="flex gap-2">
                      <Select name="minPrice" onValueChange={(value) => handleSelectChange("minPrice", value)}>
                        <SelectTrigger className={`w-[100px] ${selectTriggerStyles}`}>
                          <SelectValue placeholder="Min €" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyles}>
                          {priceRanges.map((price) => (
                            <SelectItem key={price} value={price} className={selectItemStyles}>
                              €{price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select name="maxPrice" onValueChange={(value) => handleSelectChange("maxPrice", value)}>
                        <SelectTrigger className={`w-[100px] ${selectTriggerStyles}`}>
                          <SelectValue placeholder="Max €" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyles}>
                          {priceRanges.map((price) => (
                            <SelectItem key={price} value={price} className={selectItemStyles}>
                              €{price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Select name="minYear" onValueChange={(value) => handleSelectChange("minYear", value)}>
                        <SelectTrigger className={`w-[90px] ${selectTriggerStyles}`}>
                          <SelectValue placeholder="Min Year" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyles}>
                          {yearRanges.map((year) => (
                            <SelectItem key={year} value={year.toString()} className={selectItemStyles}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select name="maxYear" onValueChange={(value) => handleSelectChange("maxYear", value)}>
                        <SelectTrigger className={`w-[90px] ${selectTriggerStyles}`}>
                          <SelectValue placeholder="Max Year" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyles}>
                          {yearRanges.map((year) => (
                            <SelectItem key={year} value={year.toString()} className={selectItemStyles}>
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
                <div className="space-y-4 flex flex-col items-center">
                  {/* Tab Headers */}
                  <div className="flex space-x-1 border-b border-[#2D2D2D] w-full max-w-[600px] justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('priorities')}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors",
                        activeTab === 'priorities'
                          ? "bg-[#6366f1]/10 text-[#6366f1] border-b-2 border-[#6366f1]"
                          : "bg-transparent text-gray-400 hover:text-[#6366f1]/70"
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
                          ? "bg-[#6366f1]/10 text-[#6366f1] border-b-2 border-[#6366f1]"
                          : "bg-transparent text-gray-400 hover:text-[#6366f1]/70"
                      )}
                    >
                      Must Have
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="pt-2 w-full max-w-[600px]">
                    {activeTab === 'priorities' && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 justify-center">
                        {priorities.map((priority) => (
                          <label
                            key={priority}
                            className="flex items-center space-x-1.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={formData.priorities.includes(priority)}
                              onChange={() => handleCheckboxChange('priorities', priority)}
                              className="h-3 w-3 rounded border-[#6366f1]/30 text-[#6366f1] focus:ring-[#6366f1]/20"
                            />
                            <span className="text-gray-200">{priority}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {activeTab === 'mustHave' && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 justify-center">
                        {mustHaveFeatures.map((feature) => (
                          <label
                            key={feature}
                            className="flex items-center space-x-1.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={formData.mustHaveFeatures.includes(feature)}
                              onChange={() => handleCheckboxChange('mustHave', feature)}
                              className="h-3 w-3 rounded border-[#6366f1]/30 text-[#6366f1] focus:ring-[#6366f1]/20"
                            />
                            <span className="text-gray-200">{feature}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="flex justify-center w-full max-w-[600px]">
                    <Select name="usage" onValueChange={(value) => handleSelectChange("usage", value)}>
                      <SelectTrigger className={`w-64 ${selectTriggerStyles}`}>
                        <SelectValue placeholder="How will you use this car?" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        {usageOptions.map((option) => (
                          <SelectItem key={option} value={option} className={selectItemStyles}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-center w-full max-w-[600px]">
                    <Input
                      type="text"
                      placeholder="Any must have feature?"
                      value={formData.customFeature}
                      onChange={(e) => setFormData(prev => ({ ...prev, customFeature: e.target.value }))}
                      className={inputStyles}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex items-center gap-2 bg-[#2A2A2A] text-gray-200 border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
              </div>
              <Button
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
                className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4F46E5] text-white"
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
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
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
const selectTriggerStyles = "h-9 px-3 bg-white rounded-lg border border-gray-200 shadow-sm data-[placeholder]:text-gray-500 text-sm relative [&>svg]:hidden hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
const selectContentStyles = "bg-white min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg shadow-md border border-gray-200 fixed"
const selectItemStyles = "py-2 px-3 text-sm cursor-pointer data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent automatic submission
    if (!autoSubmitted) {
      setAutoSubmitted(true);
      return;
    }
    
    // Only validate step 1 fields
    if (!isFormValid()) {
      setError('Please make at least one selection in step 1 before searching.');
      setCurrentStep(1); // Return to step 1 if validation fails
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
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
      setIsSubmitting(false);
    }
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
      <div className="max-w-xl mx-auto bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-center items-center gap-2 mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep === num
                      ? "bg-gray-600 text-white"
                      : "bg-gray-50 text-gray-600"
                  )}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      num < currentStep ? "bg-gray-600" : "bg-gray-200"
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
                <div className="space-y-8">
                  {/* Location, Make, and Model in one row */}
                  <div className="flex w-full gap-2 mb-3">
                    {/* Location */}
                    <Select name="location" onValueChange={(value) => handleSelectChange("location", value)}>
                      <SelectTrigger className={`w-[320px] ${selectTriggerStyles}`}>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location} className={selectItemStyles}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2 flex-1">
                      {/* Make */}
                      <Select name="make" onValueChange={(value) => handleSelectChange("make", value)}>
                        <SelectTrigger className={`w-[150px] ${selectTriggerStyles}`}>
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

                      {/* Model */}
                      <Select
                        name="model"
                        onValueChange={(value) => handleSelectChange("model", value)}
                        disabled={!formData.make}
                      >
                        <SelectTrigger className={`w-[150px] ${selectTriggerStyles}`}>
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
                  </div>

                  {/* Price Range and Year Range in one row */}
                  <div className="flex w-full gap-2">
                    {/* Price Range */}
                    <Select name="minPrice" onValueChange={(value) => handleSelectChange("minPrice", value)}>
                      <SelectTrigger className={`w-[150px] ${selectTriggerStyles}`}>
                        <SelectValue placeholder="Min Price" />
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
                      <SelectTrigger className={`w-[150px] ${selectTriggerStyles}`}>
                        <SelectValue placeholder="Max Price" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        {priceRanges.map((price) => (
                          <SelectItem key={price} value={price} className={selectItemStyles}>
                            €{price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Year Range */}
                    <Select name="minYear" onValueChange={(value) => handleSelectChange("minYear", value)}>
                      <SelectTrigger className={`w-[150px] ${selectTriggerStyles}`}>
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
                      <SelectTrigger className={`w-[150px] ${selectTriggerStyles}`}>
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
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* Tab Headers */}
                  <div className="flex space-x-1 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('priorities')}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-t-lg",
                        activeTab === 'priorities'
                          ? "bg-gray-100 text-gray-900 border-b-2 border-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Priorities
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('mustHave')}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-t-lg",
                        activeTab === 'mustHave'
                          ? "bg-gray-100 text-gray-900 border-b-2 border-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Must Have
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="pt-2">
                    {activeTab === 'priorities' && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {priorities.map((priority) => (
                          <label
                            key={priority}
                            className="flex items-center space-x-1.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={formData.priorities.includes(priority)}
                              onChange={() => handleCheckboxChange('priorities', priority)}
                              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-600">{priority}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {activeTab === 'mustHave' && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {mustHaveFeatures.map((feature) => (
                          <label
                            key={feature}
                            className="flex items-center space-x-1.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={formData.mustHaveFeatures.includes(feature)}
                              onChange={() => handleCheckboxChange('mustHave', feature)}
                              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-600">{feature}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
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
                  <div className="flex justify-center">
                    <Input
                      type="text"
                      placeholder="Any must have feature?"
                      value={formData.customFeature}
                      onChange={(e) => setFormData(prev => ({ ...prev, customFeature: e.target.value }))}
                      className="w-64 h-9 px-3 bg-white/5 border border-white/10 text-gray-200 text-sm rounded-lg placeholder:text-gray-400"
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
                    className="bg-gray-900 text-white hover:bg-gray-800 px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
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
                className="bg-gray-600 hover:bg-gray-700 text-white px-6"
                disabled={!isFormValid()}
              >
                {currentStep === 3 ? (
                  <>
                    Apply Filters
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
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

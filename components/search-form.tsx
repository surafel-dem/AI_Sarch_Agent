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
const selectTriggerStyles = "h-9 px-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 data-[placeholder]:text-gray-500 text-sm relative [&>svg]:hidden"
const selectContentStyles = "bg-white min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg shadow-md border border-gray-200 fixed"
const selectItemStyles = "py-2 px-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-200 data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-900"

const locations = ["dublin", "cork", "galway", "limerick", "waterford", "belfast", "kilkenny"];
const makes = ["volkswagen", "toyota", "bmw", "audi", "mercedes"];
const models = ["Golf", "Passat", "Tiguan", "Polo", "ID.4", "T-Roc", "Arteon"];
const priceRanges = ["5000", "10000", "15000"];
const features = ["GPS", "Bluetooth", "Leather", "Sunroof", "Camera", "Hybrid"];
const usageOptions = ["daily", "weekend", "family"];
const yearRanges = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

export function SearchForm() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    features: [] as string[],
    usage: "",
    location: ""
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
    <div className="w-full pt-32 pb-16">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-light tracking-tight text-[#5B9BFF] mb-3">
          Find Your Perfect Car
        </h1>
        <p className="text-base text-gray-400/70 font-extralight tracking-wide">
          Tell us what you're looking for and our AI will help you find the ideal car that matches your needs
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/10 p-6 rounded-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-center items-center gap-2 mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                {num > 1 && <div className="h-px w-8 bg-white/10 mx-2" />}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                    currentStep === num
                      ? 'bg-blue-500 text-white'
                      : currentStep > num
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {num}
                </div>
              </div>
            ))}
          </div>

          {/* Form content with fixed height */}
          <div className="h-[180px]">
            {currentStep === 1 && (
              <div className="w-full max-w-[800px] mx-auto px-4">
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
              <div className="w-full max-w-2xl mx-auto">
                <div className="grid grid-cols-3 gap-2">
                  {features.map((feature) => (
                    <Button
                      key={feature}
                      type="button"
                      variant={formData.features.includes(feature) ? "default" : "outline"}
                      onClick={() => handleFeatureToggle(feature)}
                      className={`h-8 px-2.5 text-xs justify-center items-center rounded-lg transition-all whitespace-nowrap ${
                        formData.features.includes(feature) 
                          ? "bg-blue-500 text-white"
                          : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                      }`}
                    >
                      {feature}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="w-full max-w-2xl mx-auto space-y-4">
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
              </div>
            )}
          </div>

          {/* Navigation buttons - consistent placement */}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              className={`bg-white/5 hover:bg-white/10 text-gray-200 border-white/10 ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type={currentStep === 3 ? 'submit' : 'button'}
              onClick={currentStep === 3 ? undefined : nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
              disabled={!isFormValid()}
            >
              {currentStep === 3 ? (
                <>
                  Search
                  <Search className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-400 text-center">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}

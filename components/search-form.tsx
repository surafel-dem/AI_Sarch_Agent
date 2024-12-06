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
const selectTriggerStyles = "h-11 px-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500/20 data-[placeholder]:text-gray-500 text-[15px] relative [&>svg]:hidden"
const selectContentStyles = "bg-white min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl shadow-lg border border-gray-200 fixed"
const selectItemStyles = "py-2.5 px-4 text-[15px] hover:bg-gray-50 cursor-pointer transition-colors duration-200 data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-900"

export function SearchForm() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
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
      setStep(1); // Return to step 1 if validation fails
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
    if (step === 1 && !isFormValid()) {
      setError('Please make at least one selection before proceeding.');
      return;
    }
    
    // Steps 2 and 3 are optional, allow proceeding
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setAutoSubmitted(false);
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Location Group */}
              <div className="flex items-center gap-2">
                <Select name="location" onValueChange={(value) => handleSelectChange("location", value)}>
                  <SelectTrigger className={`w-44 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Location" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      <SelectItem value="dublin" className={selectItemStyles}>Dublin</SelectItem>
                      <SelectItem value="cork" className={selectItemStyles}>Cork</SelectItem>
                      <SelectItem value="galway" className={selectItemStyles}>Galway</SelectItem>
                      <SelectItem value="limerick" className={selectItemStyles}>Limerick</SelectItem>
                      <SelectItem value="waterford" className={selectItemStyles}>Waterford</SelectItem>
                      <SelectItem value="belfast" className={selectItemStyles}>Belfast</SelectItem>
                      <SelectItem value="kilkenny" className={selectItemStyles}>Kilkenny</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Make & Model Group */}
              <div className="flex items-center gap-2">
                <Select name="make" onValueChange={(value) => handleSelectChange("make", value)}>
                  <SelectTrigger className={`w-44 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Make" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      <SelectItem value="volkswagen" className={selectItemStyles}>Volkswagen</SelectItem>
                      <SelectItem value="toyota" className={selectItemStyles}>Toyota</SelectItem>
                      <SelectItem value="bmw" className={selectItemStyles}>BMW</SelectItem>
                      <SelectItem value="audi" className={selectItemStyles}>Audi</SelectItem>
                      <SelectItem value="mercedes" className={selectItemStyles}>Mercedes</SelectItem>
                    </div>
                  </SelectContent>
                </Select>

                <Select
                  name="model"
                  onValueChange={(value) => handleSelectChange("model", value)}
                  disabled={!formData.make}
                >
                  <SelectTrigger className={`w-44 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Model" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      {formData.make && carModels[formData.make as CarMake].map((model) => (
                        <SelectItem key={model} value={model.toLowerCase()} className={selectItemStyles}>
                          {model}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Group */}
              <div className="flex items-center gap-2">
                <Select name="minPrice" onValueChange={(value) => handleSelectChange("minPrice", value)}>
                  <SelectTrigger className={`w-36 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Min Price" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      <SelectItem value="5000" className={selectItemStyles}>€5,000</SelectItem>
                      <SelectItem value="10000" className={selectItemStyles}>€10,000</SelectItem>
                      <SelectItem value="15000" className={selectItemStyles}>€15,000</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
                <Select name="maxPrice" onValueChange={(value) => handleSelectChange("maxPrice", value)}>
                  <SelectTrigger className={`w-36 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Max Price" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      <SelectItem value="25000" className={selectItemStyles}>€25,000</SelectItem>
                      <SelectItem value="30000" className={selectItemStyles}>€30,000</SelectItem>
                      <SelectItem value="35000" className={selectItemStyles}>€35,000</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range Group */}
              <div className="flex items-center gap-2">
                <Select name="minYear" onValueChange={(value) => handleSelectChange("minYear", value)}>
                  <SelectTrigger className={`w-36 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Min Year" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      <SelectItem value="2018" className={selectItemStyles}>2018</SelectItem>
                      <SelectItem value="2019" className={selectItemStyles}>2019</SelectItem>
                      <SelectItem value="2020" className={selectItemStyles}>2020</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
                <Select name="maxYear" onValueChange={(value) => handleSelectChange("maxYear", value)}>
                  <SelectTrigger className={`w-36 ${selectTriggerStyles}`}>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue placeholder="Max Year" />
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                    <div className="py-1">
                      <SelectItem value="2022" className={selectItemStyles}>2022</SelectItem>
                      <SelectItem value="2023" className={selectItemStyles}>2023</SelectItem>
                      <SelectItem value="2024" className={selectItemStyles}>2024</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-2 px-4">
              {["GPS", "Bluetooth", "Leather", "Sunroof", "Camera", "Hybrid"].map((feature) => (
                <Button
                  key={feature}
                  type="button"
                  variant={formData.features.includes(feature) ? "default" : "outline"}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`h-9 text-sm justify-center items-center rounded-lg transition-all ${
                    formData.features.includes(feature) 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm border-0" 
                      : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-200"
                  }`}
                >
                  {feature}
                </Button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="px-4">
              <Select name="usage" onValueChange={(value) => handleSelectChange("usage", value)}>
                <SelectTrigger className={`w-full max-w-xs mx-auto ${selectTriggerStyles}`}>
                  <div className="flex items-center justify-between w-full">
                    <SelectValue placeholder="How will you use this car? (Optional)" />
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  </div>
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className={selectContentStyles}>
                  <div className="py-1">
                    <SelectItem value="daily" className={selectItemStyles}>Daily Commute</SelectItem>
                    <SelectItem value="weekend" className={selectItemStyles}>Weekend Trips</SelectItem>
                    <SelectItem value="family" className={selectItemStyles}>Family Car</SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  return (
    <div className="relative isolate">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Fixed height container */}
        <div className="min-h-[280px] flex flex-col">
          {/* Step indicator */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400">Step {step} of 3</p>
          </div>

          {/* Form content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="mt-auto pt-4 flex justify-between px-2">
            {step > 1 && (
              <Button 
                onClick={prevStep}
                type="button"
                variant="ghost" 
                className="h-8 px-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button 
                onClick={nextStep}
                type="button"
                className="h-9 px-6 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 ml-auto rounded-lg transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={() => setAutoSubmitted(true)}
                type="submit"
                className="h-9 px-6 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 ml-auto rounded-lg transition-all duration-200 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 relative">
                      <div className="absolute inset-0 border-2 border-white border-opacity-20 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-r-transparent border-white animate-spin rounded-full"></div>
                    </div>
                    <span className="ml-2">Searching...</span>
                  </div>
                ) : (
                  <>
                    Find Cars
                    <Search className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-500 text-center">{error}</div>
        )}
      </form>
    </div>
  );
}

export interface CarDetails {
  fuel_type: string | null;
  body_type: string | null;
}

export interface Car {
  listing_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string;
  description: string;
  transmission: string | null;
  listing_status: string | null;
  details: CarDetails;
}

export interface CarSpecs {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  mileage?: number;
  features?: string[];
  priorities?: string[];
  mustHaveFeatures?: string[];
  usage?: string;
  customFeature?: string;
}

export interface Source {
  name: string;
  logo: string;
  url?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  userId: string;
  sessionId: string;
  listings?: Car[];
  sources?: Source[];
}

export interface WebhookPayload {
  userId?: string;
  sessionId: string;
  chatInput: string;
  carSpecs?: CarSpecs;
  timestamp: number;
}

export interface WebhookResponse {
  message: string;
  listings?: Array<{
    title: string;
    price: number;
    year: number;
    location: string;
    url: string;
  }>;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}

export interface SearchResponse {
  status: string;
  type: string;
  matches: number;
  results: Car[];
}

export interface Car {
  listing_id: string;
  make: string;
  model: string | null;
  year: number | null;
  price: number | null;
  engine: number | null;
  location: string;
  seller: string | null;
  description: string | null;
  url: string | null;
  created_at: string | null;
  updated_at: string | null;
  transmission: string | null;
  listing_status: string | null;
  processed_for_details: boolean | null;
  first_seen: string | null;
}

export interface CarDetails {
  fuel_type: string | null;
  body_type: string | null;
}

export interface CarListingResponse {
  status: string;
  type: 'car_listing';
  matches: number;
  results: Car[];
}

export interface TextResponse {
  type: 'text';
  content: string;
}

export interface AgentResponse {
  content?: string;
  error?: string;
  suggestions?: string[];
  analysis?: {
    price?: string;
    market?: string;
    features?: string[];
  };
}

export type SearchResponse = {
  type: 'car_listing' | 'text';
  message: string;
  results: Car[];
  loading?: boolean;
  aiResponse?: AgentResponse | string;
  sessionId?: string;
}

export interface CarSpecs {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  transmission?: string;
  bodyType?: string;
  fuelType?: string;
  keywords?: string[];
}

export interface Source {
  name: string;
  logo: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  response?: SearchResponse;
  isLoading?: boolean;
}

export interface WebhookPayload {
  userId?: string;
  sessionId: string;
  chatInput?: string;
  carSpecs?: CarSpecs;
  timestamp: number;
  searchResults?: any[];
  initialSearch?: boolean;
}

export interface WebhookResponse {
  type: 'car_listing' | 'text';
  message: string;
  results?: Car[];
  output?: string;  // For responses that contain JSON wrapped in code blocks
}

export type SearchSessionStatus = 
  | 'pending'      // Initial state
  | 'searching'    // Querying database
  | 'ai_processing' // AI generating insights
  | 'completed'    // Everything done
  | 'failed';      // Error occurred

export interface AIInsight {
  summary: string;
  priceAnalysis?: {
    marketPosition: string;
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
  };
  recommendations?: string[];
  marketTrends?: string[];
}

export interface SearchSession {
  session_id: string;
  clerk_id: string | null;
  user_id: string;
  search_params: CarSpecs;
  results?: any[];
  ai_insights: AIInsight | null;
  status: SearchSessionStatus;
  total_results: number | null;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

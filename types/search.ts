export interface CarSpecs {
  make?: string;
  model?: string;
  year?: string;
  county?: string;
  features?: string[];
  usage?: string;
  minPrice?: string;
  maxPrice?: string;
  [key: string]: any; // Allow for additional specifications
}

export interface WebhookPayload {
  userId: string;
  sessionId: string;
  chatInput: string;
  carSpecs?: CarSpecs;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  userId: string;        // Added to track message ownership
  sessionId: string;     // Added to group messages by session
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
  message: string;
  listings: any[];
  sources: string[];
  sessionId: string;     // Echo back the session ID
  timestamp: number;     // When the response was generated
}

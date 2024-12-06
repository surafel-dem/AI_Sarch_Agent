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
  userId: string;        // Clerk user ID
  sessionId: string;     // Unique session identifier
  chatInput: string;     // User's search query
  carSpecs: CarSpecs;    // Car specifications
  timestamp?: number;    // When the message was sent
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  userId: string;        // Added to track message ownership
  sessionId: string;     // Added to group messages by session
}

export interface SearchResponse {
  message: string;
  listings: any[];
  sources: string[];
  sessionId: string;     // Echo back the session ID
  timestamp: number;     // When the response was generated
}

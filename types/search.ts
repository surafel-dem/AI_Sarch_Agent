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
  sessionId: string;
  chatInput: string;
  carSpecs: CarSpecs;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

import rateLimit from '@/lib/utils/rate-limit';
import { CarSpecs } from '@/types/search';

export class AgentService {
  private static instance: AgentService;
  private readonly baseUrl = 'https://n8n.yotor.co/webhook/invoke_agent';
  private readonly token = process.env.NEXT_PUBLIC_AGENT_TOKEN;
  private readonly limiter = rateLimit({
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 100,
  });

  private constructor() {}

  static getInstance(): AgentService {
    if (!this.instance) {
      this.instance = new AgentService();
    }
    return this.instance;
  }

  private async checkRateLimit(sessionId: string) {
    try {
      await this.limiter.check(10, sessionId); // 10 requests per minute per session
      console.log('AgentService: Rate limit check passed for session:', sessionId);
    } catch (error) {
      console.error('AgentService: Rate limit exceeded for session:', sessionId);
      throw new Error('Too many requests. Please try again later.');
    }
  }

  public async invoke(
    sessionId: string,
    filters: CarSpecs,
    results: any[],
    userMessage?: string,
    lastSearchMessage?: string
  ): Promise<any> {
    try {
      if (!this.token) {
        throw new Error('Agent service token not configured');
      }

      await this.checkRateLimit(sessionId);

      const payload = this.preparePayload(sessionId, filters, results, userMessage, lastSearchMessage);

      console.log('AgentService: Preparing payload with filters:', filters);
      console.log('Preparing n8n webhook payload:', payload);

      return await this.makeRequestWithRetry(
        this.baseUrl,
        payload
      );
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private async makeRequestWithRetry(
    url: string,
    payload: any,
    maxRetries: number = 3,
    initialDelay: number = 2000
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AgentService: Making request attempt ${attempt}/${maxRetries}`);
        console.log('AgentService: Sending request to:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Request failed with status: ${response.status}. Error: ${errorText}`
          );
        }

        const data = await response.json();
        console.log('AgentService: Received successful response:', data);
        return data;
      } catch (error) {
        console.error(`AgentService: Request failed (attempt ${attempt}):`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`AgentService: Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private preparePayload(sessionId: string, filters: CarSpecs, results: any[], userMessage?: string, lastSearchMessage?: string) {
    // Filter out empty values
    const selectedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('Preparing n8n webhook payload:', {
      sessionId,
      userMessage,
      filters: selectedFilters,
      resultsCount: results.length
    });

    return {
      sessionId,
      chatInput: userMessage || '', // Let the agent generate its own description
      carSpecs: selectedFilters,
      timestamp: new Date().toISOString(),
      results: {
        count: results.length,
        items: results.map(car => ({
          id: car.listing_id,
          title: car.title || `${car.year} ${car.make} ${car.model}`,
          price: car.price,
          details: {
            ...car, // Pass all car details to let agent decide what to use
            listingUrl: car.listingUrl
          }
        }))
      },
      searchContext: lastSearchMessage ? {
        lastSearchMessage,
        lastSearchResults: results,
        lastSearchFilters: selectedFilters
      } : undefined
    };
  }
}

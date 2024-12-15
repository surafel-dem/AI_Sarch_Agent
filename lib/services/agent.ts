import rateLimit from '@/lib/utils/rate-limit';
import { CarSpecs } from '@/types/search';

export class AgentService {
  private static instance: AgentService;
  private readonly maxRetries = 3;
  private readonly baseUrl = 'https://n8n.yotor.co/webhook/invoke_agent';
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

  async invoke(sessionId: string, filters: CarSpecs, results: any[], userMessage?: string, lastSearchMessage?: string) {
    // Rate limiting
    try {
      await this.limiter.check(10, sessionId); // 10 requests per minute per session
    } catch (error) {
      throw new Error('Too many requests. Please try again later.');
    }

    // Prepare payload
    const payload = this.preparePayload(sessionId, filters, results, userMessage, lastSearchMessage);

    // Make request with retries
    return await this.makeRequestWithRetry(payload);
  }

  private async makeRequestWithRetry(payload: any, attempt = 1): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to invoke agent: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Agent request failed (attempt ${attempt}):`, error);
      
      if (attempt < this.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(payload, attempt + 1);
      }
      throw error;
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

    // Create a human-readable filter description
    const filterDescription = Object.entries(selectedFilters)
      .map(([key, value]) => {
        switch (key) {
          case 'make':
            return `Make: ${value}`;
          case 'model':
            return `Model: ${value}`;
          case 'minYear':
            return `Year from: ${value}`;
          case 'maxYear':
            return `Year to: ${value}`;
          case 'minPrice':
            return `Price from: €${value}`;
          case 'maxPrice':
            return `Price to: €${value}`;
          case 'location':
            return `Location: ${value}`;
          default:
            return `${key}: ${value}`;
        }
      })
      .filter(Boolean)
      .join(', ');

    console.log('Preparing n8n webhook payload:', {
      sessionId,
      userMessage,
      filterDescription,
      resultsCount: results.length
    });

    return {
      sessionId,
      chatInput: userMessage || filterDescription, // Use user message if provided, otherwise use filter description
      carSpecs: selectedFilters,
      timestamp: new Date().toISOString(),
      results: {
        count: results.length,
        items: results.map(car => ({
          id: car.listing_id,
          title: `${car.year} ${car.make} ${car.model}`,
          price: car.price,
          details: {
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            location: car.location,
            transmission: car.transmission,
            description: car.description
          }
        }))
      },
      searchContext: {
        lastSearchMessage,
        lastSearchResults: results,
        lastSearchFilters: filters
      }
    };
  }
}

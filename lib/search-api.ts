import { WebhookPayload, WebhookResponse, CarListingResponse } from '@/types/search';

export async function invokeSearchAgent(payload: WebhookPayload): Promise<WebhookResponse> {
  console.log('Sending search payload:', payload);
  
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: payload.userId,
        sessionId: payload.sessionId,
        chatInput: payload.chatInput,
        carSpecs: payload.carSpecs || {},
        timestamp: payload.timestamp
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error response:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Search API response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Handle responses that contain JSON strings in the output field
    if (data.output && typeof data.output === 'string') {
      try {
        const match = data.output.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          const parsedJson = JSON.parse(match[1]);
          if (parsedJson.type === 'car_listing') {
            return {
              type: 'car_listing',
              message: data.message || '',
              results: parsedJson.results
            };
          }
        }
      } catch (e) {
        console.error('Error parsing JSON from output:', e);
      }
    }

    // Handle responses that contain JSON strings in the message field
    if (data.message && typeof data.message === 'string') {
      try {
        const match = data.message.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          const parsedJson = JSON.parse(match[1]);
          if (parsedJson.type === 'car_listing') {
            return {
              type: 'car_listing',
              message: '',
              results: parsedJson.results
            };
          }
        }
      } catch (e) {
        console.error('Error parsing JSON from message:', e);
      }
    }

    // If no JSON was found or parsed, return the original response
    return {
      type: data.type || 'text',
      message: data.message || '',
      results: data.results || []
    };
  } catch (error) {
    console.error('Error in search request:', error);
    throw error;
  }
}

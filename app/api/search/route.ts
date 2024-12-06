import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { WebhookPayload, SearchResponse } from '@/types/search';
import { auth } from '@clerk/nextjs';

export async function POST(request: Request) {
  try {
    // Get auth session
    const session = auth();
    const body = await request.json();
    const token = process.env.NEXT_PUBLIC_AGENT_TOKEN || 'Tmichael12@';

    // Extract user ID from session
    const userId = session.userId || body.userId;
    
    console.log('Processing search request for user:', { 
      userId,
      sessionId: body.sessionId,
      authenticated: !!session.userId 
    });

    // Prepare the webhook payload
    const payload: WebhookPayload = {
      userId,
      sessionId: body.sessionId,
      chatInput: body.chatInput,
      carSpecs: body.carSpecs || {},
      timestamp: Date.now()
    };

    console.log('Sending payload to n8n:', {
      userId: payload.userId,
      sessionId: payload.sessionId,
      timestamp: new Date(payload.timestamp).toISOString()
    });

    const response = await fetch(config.n8n.webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-User-ID': userId,
        'X-Session-ID': body.sessionId
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', {
        status: response.status,
        error: errorText,
        userId,
        sessionId: body.sessionId
      });
      return NextResponse.json(
        { error: `Failed to process search request: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format the response
    const formatResponse = (responseData: any): SearchResponse => ({
      message: responseData.output || responseData.message || 'No response from the agent.',
      listings: responseData.listings || [],
      sources: responseData.sources || [],
      sessionId: payload.sessionId,
      timestamp: Date.now()
    });
    
    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      const response = formatResponse(data[0]);
      console.log('Formatted array response:', {
        userId,
        sessionId: response.sessionId,
        hasListings: response.listings.length > 0
      });
      return NextResponse.json(response);
    }
    
    // Handle object response
    if (data && (data.output || data.message)) {
      const response = formatResponse(data);
      console.log('Formatted object response:', {
        userId,
        sessionId: response.sessionId,
        hasListings: response.listings.length > 0
      });
      return NextResponse.json(response);
    }

    console.error('Invalid response format from n8n:', {
      userId,
      sessionId: body.sessionId,
      responseType: typeof data,
      isArray: Array.isArray(data)
    });

    return NextResponse.json(
      { error: 'Invalid response format from agent' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in search agent:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}

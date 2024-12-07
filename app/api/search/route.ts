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

    // Extract user ID from session or use temporary ID
    const userId = session.userId || body.userId;
    
    if (!userId) {
      console.error('No user ID provided in request:', { body });
      return new Response('No user ID provided', { status: 400 });
    }

    if (!body.sessionId) {
      console.error('No session ID provided in request:', { body });
      return new Response('No session ID provided', { status: 400 });
    }

    const isTemporaryUser = userId.startsWith('temp');
    
    console.log('Processing search request for user:', { 
      userId,
      sessionId: body.sessionId,
      authenticated: !!session.userId,
      isTemporaryUser,
      requestBody: body
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
    const formatResponse = (responseData: any): string => {
      if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData[0].output || responseData[0].message || 'No response from the agent.';
      }
      return responseData.output || responseData.message || 'No response from the agent.';
    };
    
    const formattedResponse = formatResponse(data);
    console.log('Formatted response:', {
      userId,
      sessionId: payload.sessionId,
      response: formattedResponse
    });
    
    return NextResponse.json({ message: formattedResponse });
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

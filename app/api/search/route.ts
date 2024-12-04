import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.NEXT_PUBLIC_AGENT_TOKEN || 'Tmichael12@';

    const response = await fetch(config.n8n.webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      return NextResponse.json(
        { error: `Network response was not ok: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // If the response is an array, return the first item's output
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json({
        message: data[0].output || 'No response from the agent.',
        listings: data[0].listings || [],
        sources: data[0].sources || []
      });
    }
    
    // If the response is an object with output
    if (data && data.output) {
      return NextResponse.json({
        message: data.output,
        listings: data.listings || [],
        sources: data.sources || []
      });
    }

    return NextResponse.json({ error: 'Invalid response format from agent' }, { status: 500 });
  } catch (error) {
    console.error('Error in search agent:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}

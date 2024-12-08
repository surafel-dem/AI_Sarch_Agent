import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function handleUserCreated(event: WebhookEvent) {
  const { id, email_addresses, image_url } = event.data;
  
  try {
    const { error: createError } = await supabase
      .from('users')
      .insert({
        clerk_id: id,
        email: email_addresses[0]?.email_address,
        avatar_url: image_url,
        subscription_tier: 'free',
        subscription_status: 'active',
        total_conversations: 0,
        total_searches: 0,
        message_count: 0,
        token_usage: 0
      });

    if (createError) {
      console.error('Error creating user in Supabase:', createError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error creating user:', error);
    return false;
  }
}

async function handleUserUpdated(event: WebhookEvent) {
  const { id, email_addresses, image_url } = event.data;

  try {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email: email_addresses[0]?.email_address,
        avatar_url: image_url,
      })
      .eq('clerk_id', id);

    if (updateError) {
      console.error('Error updating user in Supabase:', updateError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error updating user:', error);
    return false;
  }
}

async function handleUserDeleted(event: WebhookEvent) {
  const { id } = event.data;

  try {
    // First, delete any related records in other tables
    // For example, if you have a conversations table with user_id foreign key:
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', id);

    if (conversationsError) {
      console.error('Error deleting user conversations:', conversationsError);
    }

    // Then delete the user record
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('clerk_id', id);

    if (deleteError) {
      console.error('Error deleting user from Supabase:', deleteError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error deleting user:', error);
    return false;
  }
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  try {
    const eventType = evt.type;
    console.log(`Processing webhook event: ${eventType}`);

    let success = false;

    switch (eventType) {
      case 'user.created':
        success = await handleUserCreated(evt);
        break;
      case 'user.updated':
        success = await handleUserUpdated(evt);
        break;
      case 'user.deleted':
        success = await handleUserDeleted(evt);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
        success = true; // Mark as success for events we don't handle
    }

    if (!success) {
      return new Response('Webhook processing failed', { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}

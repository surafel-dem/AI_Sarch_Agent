import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

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

async function syncUserToSupabase(clerkId: string, userData: { 
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}) {
  console.log('Starting user sync to Supabase:', { clerkId, ...userData });
  
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    console.log('Existing user check result:', { existingUser, error: fetchError });

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking for existing user:", fetchError);
      throw fetchError;
    }

    const userDataToSync = {
      ...(userData.email && { email: userData.email }),
      ...(userData.imageUrl && { avatar_url: userData.imageUrl }),
      updated_at: new Date().toISOString()
    };

    if (!existingUser) {
      console.log('Creating new user in Supabase:', { clerkId, ...userDataToSync });
      
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          clerk_id: clerkId,
          ...userDataToSync,
          subscription_tier: 'free',
          subscription_status: 'active',
          total_conversations: 0,
          total_searches: 0,
          message_count: 0,
          token_usage: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create user in Supabase:", insertError);
        throw insertError;
      }

      console.log('Successfully created user in Supabase:', newUser);
      return newUser;
    } else {
      // Only update if there are changes
      if (Object.keys(userDataToSync).length > 0) {
        console.log('Updating existing user in Supabase:', { clerkId, ...userDataToSync });
        
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update(userDataToSync)
          .eq("clerk_id", clerkId)
          .select()
          .single();

        if (updateError) {
          console.error("Failed to update user in Supabase:", updateError);
          throw updateError;
        }

        console.log('Successfully updated user in Supabase:', updatedUser);
        return updatedUser;
      }

      console.log('No changes needed for user in Supabase:', existingUser);
      return existingUser;
    }
  } catch (error) {
    console.error('Error in syncUserToSupabase:', error);
    throw error;
  }
}

async function deleteUserFromSupabase(clerkId: string) {
  console.log('Starting user deletion from Supabase:', clerkId);
  
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("Failed to delete user from Supabase:", error);
      throw error;
    }

    console.log('Successfully deleted user from Supabase:', clerkId);
  } catch (error) {
    console.error('Error in deleteUserFromSupabase:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  console.log('Webhook received at:', new Date().toISOString());
  
  try {
    // Get the headers
    const headersList = headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    console.log('Webhook headers:', { svix_id, svix_timestamp, svix_signature });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new Response("Error occurred -- missing svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    console.log('Webhook payload:', payload);

    // Verify the webhook
    const headerPayload = {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    };

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, headerPayload) as WebhookEvent;
      console.log('Webhook verified successfully');
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error verifying webhook signature", {
        status: 400,
      });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log('Processing webhook event:', { eventType, id, data: evt.data });

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const { email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses?.[0]?.email_address;

        console.log('Processing user create/update:', { email, first_name, last_name });

        await syncUserToSupabase(id, {
          email,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        });
        break;
      }
      
      case "user.deleted": {
        console.log('Processing user deletion:', id);
        await deleteUserFromSupabase(id);
        break;
      }

      default:
        console.log('Ignoring unhandled event type:', eventType);
    }

    console.log('Webhook processed successfully');
    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

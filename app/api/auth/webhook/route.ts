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

async function syncUserToSupabase(id: string, email: string) {
  console.log('Syncing user to Supabase:', { id, email });
  
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, clerk_id, email")
      .eq("clerk_id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking for existing user:", fetchError);
      throw fetchError;
    }

    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          clerk_id: id,
          email: email,
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
      if (existingUser.email !== email) {
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({ email: email })
          .eq("clerk_id", id)
          .select()
          .single();

        if (updateError) {
          console.error("Failed to update user in Supabase:", updateError);
          throw updateError;
        }

        console.log('Successfully updated user in Supabase:', updatedUser);
        return updatedUser;
      }

      console.log('User already exists in Supabase:', existingUser);
      return existingUser;
    }
  } catch (error) {
    console.error('Error in syncUserToSupabase:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  console.log('Webhook received:', new Date().toISOString());
  
  try {
    // Get the headers using async headers() function
    const headersList = await headers();
    
    // Extract required headers
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new Response("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create header payload for verification
    const headerPayload = {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    };

    // Verify the webhook
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, headerPayload) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error verifying webhook signature", {
        status: 400,
      });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log('Event type:', eventType);

    if (eventType === "user.created" || eventType === "user.updated") {
      const { email_addresses } = evt.data;
      const email = email_addresses[0]?.email_address;

      console.log('Processing user event:', { eventType, id, email });

      if (email) {
        await syncUserToSupabase(id, email);
        console.log('User sync process completed');
      } else {
        console.log('No email found in the webhook data');
      }
    } else {
      console.log('Ignoring non-user event:', eventType);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new Response("Internal server error", { status: 500 });
  }
}

import { supabase } from './supabase'

// Note: These templates need to be configured in the Supabase dashboard
// Go to Authentication > Email Templates
export const emailTemplates = {
  magicLink: {
    subject: 'Welcome to Voiture - Your Login Link',
    content: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a237e; padding: 20px; text-align: center;">
        <div style="background-color: #ffd700; width: 50px; height: 50px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
          <span style="color: #1a237e; font-size: 24px; font-weight: bold;">V</span>
        </div>
        <h1 style="color: white; margin-top: 15px;">Voiture</h1>
      </div>
      
      <div style="padding: 30px; background-color: white;">
        <h2 style="color: #1a237e; margin-bottom: 20px;">Welcome to Voiture!</h2>
        
        <p style="color: #333; line-height: 1.5; margin-bottom: 25px;">
          Click the button below to securely sign in to your account. This link will expire in 24 hours.
        </p>
        
        <div style="text-align: center;">
          <a href="{{ .ConfirmationURL }}" 
             style="display: inline-block; background-color: #ffd700; color: #1a237e; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Sign In to Voiture
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 25px;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>Voiture - Your AI-Powered Car Search Assistant</p>
        <p>© ${new Date().getFullYear()} Voiture. All rights reserved.</p>
      </div>
    </div>
    `
  }
}

// Instructions for setting up email templates in Supabase:
/*
1. Go to your Supabase dashboard
2. Navigate to Authentication > Email Templates
3. Click on "Magic Link"
4. Update the following fields:
   - Subject: "Welcome to Voiture - Your Login Link"
   - Copy the HTML content from the template above
5. Save the changes

Note: Make sure to keep the {{ .ConfirmationURL }} placeholder in the template
      as Supabase uses this to insert the actual magic link.
*/

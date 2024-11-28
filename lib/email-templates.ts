export const getMagicLinkEmail = (magicLink: string) => ({
  subject: 'Login to CarSearchAI',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Login to CarSearchAI</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            line-height: 1.5;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #8A2BE2;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to CarSearchAI!</h1>
          <p>Click the button below to sign in to your account. This link will expire in 24 hours.</p>
          <a href="${magicLink}" class="button">Sign In to CarSearchAI</a>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <div class="footer">
            <p>This email was sent by CarSearchAI. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `
})

export const getWelcomeEmail = (name: string) => ({
  subject: 'Welcome to CarSearchAI',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to CarSearchAI</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            line-height: 1.5;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            padding: 20px;
          }
          .feature {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #8A2BE2;
            background: #f8f9fa;
          }
          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to CarSearchAI!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining CarSearchAI! We're excited to help you find your perfect car.</p>
          
          <div class="feature">
            <h3>🤖 AI-Powered Search</h3>
            <p>Use natural language to describe your dream car, and let our AI find the perfect match.</p>
          </div>
          
          <div class="feature">
            <h3>💬 Interactive Chat</h3>
            <p>Have a conversation with our AI to refine your search and get personalized recommendations.</p>
          </div>
          
          <div class="feature">
            <h3>📊 Detailed Analysis</h3>
            <p>Get comprehensive information about each car, including specs, pricing, and market comparisons.</p>
          </div>
          
          <p>Ready to start your car search journey? Just log in and start chatting with our AI!</p>
          
          <div class="footer">
            <p>This email was sent by CarSearchAI. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `
})

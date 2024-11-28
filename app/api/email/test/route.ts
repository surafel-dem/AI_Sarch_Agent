import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

export async function GET() {
  try {
    const result = await sendEmail({
      to: 'yotoragency@gmail.com', // Replace with your email for testing
      subject: 'Test Email from CarSearchAI',
      html: '<h1>Test Email</h1><p>This is a test email from CarSearchAI using Resend.</p>'
    })

    if (!result.success) {
      throw new Error(result.error as any)
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Test email failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}

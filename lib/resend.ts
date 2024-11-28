import { Resend } from 'resend';
import { getMagicLinkEmail, getWelcomeEmail } from './email-templates';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    const data = await resend.emails.send({
      from: 'CarSearchAI <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendMagicLinkEmail = async (to: string, magicLink: string) => {
  const { subject, html } = getMagicLinkEmail(magicLink);
  return sendEmail({ to, subject, html });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const { subject, html } = getWelcomeEmail(name);
  return sendEmail({ to, subject, html });
};

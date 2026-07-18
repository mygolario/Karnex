
const RESEND_API_URL = "https://api.resend.com/emails";

export type EmailTemplate = 
  | 'welcome' 
  | 'verification' 
  | 'password_reset' 
  | 'subscription_success' 
  | 'contact'
  | 'plan_activation'
  | 'invoice'
  | 'invitation';

interface SendEmailParams {
  to: string;
  subject: string;
  templateName: EmailTemplate; // We can use this to select HTML templates later
  htmlContent: string; // Direct HTML for now, or use template IDs
  name?: string;
  cc?: string; // Add optional CC field
}

export const sendEmail = async ({ to, subject, htmlContent, name, cc }: SendEmailParams) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is missing. Email not sent.");
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Karnex Support <support@karnex.ir>",
        to: [to],
        cc: cc ? [cc] : undefined,
        subject: subject,
        html: htmlContent,
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API Error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email Network Error:", error);
    return false;
  }
};

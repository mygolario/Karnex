
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export type EmailTemplate = 
  | 'welcome' 
  | 'verification' 
  | 'password_reset' 
  | 'subscription_success' 
  | 'contact'
  | 'invoice';

interface SendEmailParams {
  to: string;
  subject: string;
  templateName: EmailTemplate; // We can use this to select HTML templates later
  htmlContent: string; // Direct HTML for now, or use template IDs
  name?: string;
  cc?: string; // Add optional CC field
}

export const sendEmail = async ({ to, subject, htmlContent, name, cc }: SendEmailParams) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ BREVO_API_KEY is missing. Email not sent.");
    return false;
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Karnex Support",
          email: "support@karnex.ir"
        },
        to: [{ email: to, name: name || to }],
        cc: cc ? [{ email: cc }] : undefined,
        subject: subject,
        htmlContent: htmlContent,
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Brevo API Error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email Network Error:", error);
    return false;
  }
};

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getContactAdminTemplate, getContactUserTemplate } from '@/lib/email-templates';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Basic Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدها را پر کنید.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'آدرس ایمیل وارد شده معتبر نیست.' },
        { status: 400 }
      );
    }


    // Email to Support Team (Forwarding)
    const adminHtml = getContactAdminTemplate({ name, email, subject, message });
    const supportEmailSuccess = await sendEmail({
      to: 'support@karnex.ir',
      subject: `New Contact Form: ${subject}`,
      htmlContent: adminHtml,
      templateName: 'contact',
      name: 'Karnex Support Team',
      cc: process.env.ADMIN_CC_EMAIL
    });

    if (!supportEmailSuccess) {
      return NextResponse.json(
        { error: 'خطا در ارسال پیام. لطفاً بعداً تلاش کنید.' },
        { status: 500 }
      );
    }

    // Auto-reply to User
    const userHtml = getContactUserTemplate(name);
    await sendEmail({
      to: email,
      subject: 'دریافت پیام شما - کارنکس',
      htmlContent: userHtml,
      templateName: 'welcome', 
      name: name
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'خطای سرور داخلی.' },
      { status: 500 }
    );
  }
}

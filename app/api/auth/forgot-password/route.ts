import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'ایمیل الزامی است' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token in user settings JSON
    const currentSettings = (user.settings as any) || {};
    await prisma.user.update({
      where: { id: user.id },
      data: {
        settings: {
          ...currentSettings,
          passwordResetToken: token,
          passwordResetExpires: expires.toISOString(),
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://karnex.ir';
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">کارنکس</h1>
          <p style="color: #6b7280; margin-top: 8px;">دستیار هوشمند کارآفرینی</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #111827; margin-top: 0;">بازیابی رمز عبور</h2>
          <p style="color: #374151; line-height: 1.8;">سلام ${user.name || 'کاربر عزیز'},</p>
          <p style="color: #374151; line-height: 1.8;">درخواست بازیابی رمز عبور برای حساب کارنکس شما دریافت شد. برای تنظیم رمز عبور جدید روی دکمه زیر کلیک کنید:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed, #f97316); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              تنظیم رمز عبور جدید
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.8;">این لینک تا <strong>۱ ساعت</strong> معتبر است. اگر شما این درخواست را ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">اگر دکمه کار نمی‌کند، این لینک را در مرورگر باز کنید:<br/><a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a></p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'بازیابی رمز عبور کارنکس',
      templateName: 'password_reset',
      htmlContent,
      name: user.name || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

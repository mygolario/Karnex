import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'لینک نامعتبر است' }, { status: 400 });
    }

    const settings = (user.settings as any) || {};
    const savedToken = settings.passwordResetToken;
    const expiresAt = settings.passwordResetExpires ? new Date(settings.passwordResetExpires) : null;

    if (!savedToken || savedToken !== token) {
      return NextResponse.json({ error: 'لینک نامعتبر است' }, { status: 400 });
    }

    if (!expiresAt || expiresAt < new Date()) {
      return NextResponse.json({ error: 'لینک منقضی شده است. لطفاً دوباره درخواست دهید' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Clear the reset token and update password
    const { passwordResetToken, passwordResetExpires, ...restSettings } = settings;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        settings: restSettings,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

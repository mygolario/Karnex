import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET Admin Users Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

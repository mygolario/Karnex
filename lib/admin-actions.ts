"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getAdminUsers() {
  try {
    const session = await auth();

    // Check if user is admin (simple check based on email or role if you have it)
    // For now, let's assume if they can access the dashboard/admin page, they are authorized
    // explicitly via middleware or layout. But good to check here too.
    if (!session?.user?.email) {
      return { error: "Unauthorized" };
    }

    // You might want to add a role check here
    // if (session.user.role !== 'ADMIN') return { error: "Forbidden" };

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
        subscriptions: {
            select: {
                planId: true,
                status: true,
            }
        },
      }
    });

    // Transform for UI
    const formattedUsers = users.map(u => {
      const sub = u.subscriptions && u.subscriptions.length > 0 ? u.subscriptions[0] : null;
      return {
        id: u.id,
        email: u.email,
        full_name: u.name,
        avatar_url: u.image,
        role: u.role,
        subscription: sub ? { 
            planId: sub.planId, 
            status: sub.status 
        } : { planId: 'free', status: 'active' },
        credits: { aiTokens: 0, projectsUsed: 0 }, 
        settings: {},
        created_at: u.createdAt.toISOString(),
        updated_at: u.updatedAt.toISOString(),
      };
    });

    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users" };
  }
}

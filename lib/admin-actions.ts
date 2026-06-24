"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getAdminUsers() {
  try {
    const session = await auth();

    // RLS/ACL: Enforce that only users with the 'admin' role can access admin actions
    if (!session?.user || (session.user as any).role !== 'admin') {
      return { error: "Forbidden" };
    }

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
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

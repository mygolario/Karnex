"use server";

import prisma from "@/lib/prisma";
import { requireAdminResult } from "@/lib/admin/require-admin";
import { writeAdminAudit } from "@/lib/admin/audit";
import { getPlanById } from "@/lib/payment/pricing";
import { verifyPaymentAction } from "@/lib/payment-actions";
import {
  getEffectiveLaunchConfig,
  getLaunchOverrides,
  setLaunchOverrides,
} from "@/lib/launch/effective";
import type { LaunchOverrides } from "@/lib/launch/config";
import type { ProjectType } from "@/app/new-project/genesis-constants";
import type { Prisma } from "../prisma/client";
import {
  posthogPersonSearchUrl,
  posthogReplayHomeUrl,
} from "@/lib/analytics/posthog-links";
import {
  deriveFunnelStage,
  type AdminFunnelStage,
  type AdminUserDetail,
  type AdminUserRow,
} from "@/lib/admin/user-intelligence";
import { ORGANIC_USER_WHERE } from "@/lib/admin/organic-where";

function parseCredits(credits: unknown): { aiTokens: number; projectsUsed: number } {
  if (credits && typeof credits === "object" && !Array.isArray(credits)) {
    const c = credits as Record<string, unknown>;
    return {
      aiTokens: typeof c.aiTokens === "number" ? c.aiTokens : 0,
      projectsUsed: typeof c.projectsUsed === "number" ? c.projectsUsed : 0,
    };
  }
  return { aiTokens: 0, projectsUsed: 0 };
}

export async function getAdminUsers(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
  /** When true, only organic (non-test, non-admin) users */
  organicOnly?: boolean;
  /** When true, only accounts marked as test */
  testOnly?: boolean;
}) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));
  const search = params?.search?.trim();

  const where: Prisma.UserWhereInput = {
    ...(params?.includeDeleted ? {} : { deletedAt: null }),
    ...(params?.organicOnly ? ORGANIC_USER_WHERE : {}),
    ...(params?.testOnly ? { isTestUser: true } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          isTestUser: true,
          credits: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          lastSeenAt: true,
          subscriptions: {
            select: { planId: true, status: true },
          },
          tourProgress: {
            select: { completedTours: true },
          },
          _count: { select: { projects: true } },
        },
      }),
    ]);

    const formatted: AdminUserRow[] = users.map((u) => {
      const activeSub =
        u.subscriptions.find((s) => s.status === "active") ??
        u.subscriptions[0] ??
        null;
      const planId = activeSub?.planId ?? "free";
      const planStatus = activeSub?.status ?? "active";
      return {
        id: u.id,
        email: u.email,
        full_name: u.name,
        avatar_url: u.image,
        role: u.role,
        is_test_user: u.isTestUser,
        subscription: { planId, status: planStatus },
        credits: parseCredits(u.credits),
        created_at: u.createdAt.toISOString(),
        updated_at: u.updatedAt.toISOString(),
        deleted_at: u.deletedAt?.toISOString() ?? null,
        last_seen_at: u.lastSeenAt?.toISOString() ?? null,
        projectCount: u._count.projects,
        funnel_stage: deriveFunnelStage({
          projectCount: u._count.projects,
          planId,
          planStatus,
          completedTours: u.tourProgress?.completedTours,
        }),
      };
    });

    return { success: true, users: formatted, total, page, pageSize };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function setAdminUserRole(userId: string, role: "user" | "admin") {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  if (role !== "user" && role !== "admin") {
    return { error: "Invalid role" };
  }

  if (userId === gate.user.id && role !== "admin") {
    return { error: "Cannot demote yourself" };
  }

  if (role === "user") {
    const adminCount = await prisma.user.count({
      where: { role: "admin", deletedAt: null },
    });
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (target?.role === "admin" && adminCount <= 1) {
      return { error: "Cannot demote the last admin" };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "set_role",
    targetType: "User",
    targetId: userId,
    meta: { role },
  });

  return { success: true };
}

export async function setAdminUserTestFlag(userId: string, isTestUser: boolean) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  await prisma.user.update({
    where: { id: userId },
    data: { isTestUser: Boolean(isTestUser) },
  });

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "set_test_user",
    targetType: "User",
    targetId: userId,
    meta: { isTestUser: Boolean(isTestUser) },
  });

  return { success: true };
}

export async function setAdminUserPlan(
  userId: string,
  planId: string,
  billingCycle: "monthly" | "yearly" = "monthly",
) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const plan = getPlanById(planId);
  if (!plan && planId !== "free") {
    return { error: "Invalid plan" };
  }

  const now = new Date();
  const endDate = new Date(now);
  if (billingCycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setDate(endDate.getDate() + 30);
  }

  if (planId === "free") {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: "free",
        status: "active",
        billingCycle: "monthly",
        startDate: now,
        endDate: null,
        provider: "manual",
      },
      update: {
        planId: "free",
        status: "active",
        billingCycle: "monthly",
        startDate: now,
        endDate: null,
        provider: "manual",
        cancelAtPeriodEnd: false,
      },
    });
  } else {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status: "active",
        billingCycle,
        startDate: now,
        endDate,
        provider: "manual",
      },
      update: {
        planId,
        status: "active",
        billingCycle,
        startDate: now,
        endDate,
        provider: "manual",
        cancelAtPeriodEnd: false,
      },
    });
  }

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "set_plan",
    targetType: "User",
    targetId: userId,
    meta: { planId, billingCycle },
  });

  return { success: true };
}

export async function setAdminUserCredits(userId: string, aiTokens: number) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  if (!Number.isFinite(aiTokens) || aiTokens < 0) {
    return { error: "Invalid credits" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  if (!user) return { error: "User not found" };

  const current = parseCredits(user.credits);
  const next = { ...current, aiTokens: Math.floor(aiTokens) };

  await prisma.user.update({
    where: { id: userId },
    data: { credits: next as Prisma.InputJsonValue },
  });

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "set_credits",
    targetType: "User",
    targetId: userId,
    meta: { aiTokens: next.aiTokens },
  });

  return { success: true };
}

export async function softDeleteAdminUser(userId: string) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  if (userId === gate.user.id) {
    return { error: "Cannot delete yourself" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, supabaseUserId: true },
  });
  if (target?.role === "admin") {
    const adminCount = await prisma.user.count({
      where: { role: "admin", deletedAt: null },
    });
    if (adminCount <= 1) {
      return { error: "Cannot delete the last admin" };
    }
  }

  const { archiveAppUser } = await import("@/lib/auth/archive-user");
  await archiveAppUser(userId);

  if (target?.supabaseUserId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { getAdminSupabase } = await import("@/lib/supabase/admin");
      const admin = await getAdminSupabase();
      await admin.auth.admin.deleteUser(target.supabaseUserId);
    } catch (error) {
      console.error("[softDeleteAdminUser] Supabase auth delete failed:", error);
    }
  }

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "soft_delete_user",
    targetType: "User",
    targetId: userId,
  });

  return { success: true };
}

export async function restoreAdminUser(userId: string) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "restore_user",
    targetType: "User",
    targetId: userId,
  });

  return { success: true };
}

export async function getAdminTransactions(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));
  const where: Prisma.TransactionWhereInput = params?.status
    ? { status: params.status }
    : {};

  try {
    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
    ]);

    return {
      success: true,
      total,
      page,
      pageSize,
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        email: t.user?.email ?? null,
        name: t.user?.name ?? null,
        planId: t.planId,
        amount: t.amount,
        status: t.status,
        gateway: t.gateway,
        trackId: t.trackId,
        refId: t.refId,
        createdAt: t.createdAt.toISOString(),
        completedAt: t.completedAt?.toISOString() ?? null,
      })),
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { error: "Failed to fetch transactions" };
  }
}

export async function recoverAdminPayment(trackId: string) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  if (!trackId?.trim()) return { error: "trackId required" };

  const tx = await prisma.transaction.findFirst({
    where: { trackId: trackId.trim() },
  });
  if (!tx) return { error: "Transaction not found" };

  if (tx.status === "failed") {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "pending" },
    });
  }

  const result = await verifyPaymentAction(tx.trackId!);

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "recover_payment",
    targetType: "Transaction",
    targetId: tx.id,
    meta: { trackId: tx.trackId, result },
  });

  return { success: true, result };
}

export async function getAdminSupportTickets(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));
  const where: Prisma.SupportTicketWhereInput = params?.status
    ? { status: params.status }
    : {};

  try {
    const [total, tickets] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
    ]);

    return {
      success: true,
      total,
      tickets: tickets.map((t) => ({
        id: t.id,
        userId: t.userId,
        email: t.email,
        userName: t.user?.name ?? null,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        message: t.message,
        status: t.status,
        adminNote: t.adminNote,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return { error: "Failed to fetch tickets" };
  }
}

export async function updateAdminSupportTicket(
  ticketId: string,
  data: { status?: string; adminNote?: string },
) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const allowed = ["open", "in_progress", "closed"];
  if (data.status && !allowed.includes(data.status)) {
    return { error: "Invalid status" };
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.adminNote !== undefined ? { adminNote: data.adminNote } : {}),
    },
  });

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "update_ticket",
    targetType: "SupportTicket",
    targetId: ticketId,
    meta: data,
  });

  return { success: true };
}

export async function getAdminFeedback(params?: { page?: number; pageSize?: number }) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));

  try {
    const [total, items] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
    ]);

    return {
      success: true,
      total,
      items: items.map((f) => ({
        id: f.id,
        userId: f.userId,
        email: f.user?.email ?? null,
        name: f.user?.name ?? null,
        message: f.message,
        createdAt: f.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return { error: "Failed to fetch feedback" };
  }
}

export async function getAdminLaunchFlags() {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const config = await getEffectiveLaunchConfig();
  const overrides = await getLaunchOverrides();
  return { success: true, config, overrides };
}

export async function updateAdminLaunchFlags(overrides: LaunchOverrides) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const pillars = overrides.availablePillars;
  if (pillars && (!Array.isArray(pillars) || !pillars.includes("startup"))) {
    return { error: "startup pillar must remain available" };
  }

  const allPillars: ProjectType[] = ["startup", "traditional", "creator"];
  const available = (pillars ?? ["startup"]) as ProjectType[];
  const comingSoon = allPillars.filter((p) => !available.includes(p));

  const next: LaunchOverrides = {
    ...overrides,
    availablePillars: available,
    comingSoonPillars: comingSoon,
  };

  const config = await setLaunchOverrides(next);

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "update_launch_flags",
    targetType: "SystemSetting",
    targetId: "launch_overrides",
    meta: next as Record<string, unknown>,
  });

  return { success: true, config, overrides: next };
}

export async function getAdminAnalytics() {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [
      totalUsers,
      activePaidSubs,
      openTickets,
      signups30d,
      revenueAgg,
      completedTxCount,
      feedbackCount,
      organicUsers,
      organicSignups30d,
      organicPaidSubs,
      organicRevenueAgg,
      organicCompletedTxCount,
      organicFunnelUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.subscription.count({
        where: {
          status: "active",
          planId: { not: "free" },
        },
      }),
      prisma.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
      prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.transaction.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { status: "completed" } }),
      prisma.feedback.count(),
      prisma.user.count({ where: ORGANIC_USER_WHERE }),
      prisma.user.count({
        where: { ...ORGANIC_USER_WHERE, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.subscription.count({
        where: {
          status: "active",
          planId: { not: "free" },
          user: ORGANIC_USER_WHERE,
        },
      }),
      prisma.transaction.aggregate({
        where: { status: "completed", user: ORGANIC_USER_WHERE },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { status: "completed", user: ORGANIC_USER_WHERE },
      }),
      prisma.user.findMany({
        where: ORGANIC_USER_WHERE,
        select: {
          subscriptions: { select: { planId: true, status: true } },
          tourProgress: { select: { completedTours: true } },
          _count: { select: { projects: true } },
        },
      }),
    ]);

    const planBreakdown = await prisma.subscription.groupBy({
      by: ["planId"],
      where: { status: "active" },
      _count: { planId: true },
    });

    const organicPlanBreakdown = await prisma.subscription.groupBy({
      by: ["planId"],
      where: { status: "active", user: ORGANIC_USER_WHERE },
      _count: { planId: true },
    });

    const funnelStageCounts: Record<AdminFunnelStage, number> = {
      signed_up: 0,
      has_project: 0,
      activated: 0,
      paid: 0,
    };
    for (const u of organicFunnelUsers) {
      const activeSub =
        u.subscriptions.find((s) => s.status === "active") ??
        u.subscriptions[0] ??
        null;
      const stage = deriveFunnelStage({
        projectCount: u._count.projects,
        planId: activeSub?.planId ?? "free",
        planStatus: activeSub?.status ?? "active",
        completedTours: u.tourProgress?.completedTours,
      });
      funnelStageCounts[stage] += 1;
    }

    return {
      success: true,
      analytics: {
        totalUsers,
        activePaidSubs,
        openTickets,
        signups30d,
        totalRevenue: revenueAgg._sum.amount ?? 0,
        completedTxCount,
        feedbackCount,
        planBreakdown: planBreakdown.map((p) => ({
          planId: p.planId,
          count: p._count.planId,
        })),
        organic: {
          users: organicUsers,
          signups30d: organicSignups30d,
          activePaidSubs: organicPaidSubs,
          totalRevenue: organicRevenueAgg._sum.amount ?? 0,
          completedTxCount: organicCompletedTxCount,
          funnelStages: funnelStageCounts,
          planBreakdown: organicPlanBreakdown.map((p) => ({
            planId: p.planId,
            count: p._count.planId,
          })),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { error: "Failed to fetch analytics" };
  }
}

/** @deprecated Use getAdminUsers — kept for any legacy imports */
export async function getAdminUsersLegacy() {
  return getAdminUsers();
}

export async function getAdminUserDetail(userId: string) {
  const gate = await requireAdminResult();
  if (!gate.ok) return { error: gate.error };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isTestUser: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        lastSeenAt: true,
        subscriptions: { select: { planId: true, status: true } },
        tourProgress: { select: { completedTours: true } },
        projects: {
          where: { deletedAt: null },
          orderBy: { updatedAt: "desc" },
          take: 20,
          select: { id: true, projectName: true, updatedAt: true },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            planId: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        supportTickets: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
        feedbacks: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, message: true, createdAt: true },
        },
        loginEvents: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            method: true,
            ip: true,
            createdAt: true,
          },
        },
        _count: { select: { projects: true } },
      },
    });

    if (!user) return { error: "User not found" };

    const auditLogs = await prisma.adminAuditLog.findMany({
      where: { targetType: "User", targetId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: { select: { email: true } } },
    });

    const activeSub =
      user.subscriptions.find((s) => s.status === "active") ??
      user.subscriptions[0] ??
      null;
    const planId = activeSub?.planId ?? "free";
    const planStatus = activeSub?.status ?? "active";

    const detail: AdminUserDetail = {
      id: user.id,
      email: user.email,
      full_name: user.name,
      avatar_url: user.image,
      role: user.role,
      is_test_user: user.isTestUser,
      subscription: { planId, status: planStatus },
      credits: parseCredits(user.credits),
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      deleted_at: user.deletedAt?.toISOString() ?? null,
      last_seen_at: user.lastSeenAt?.toISOString() ?? null,
      projectCount: user._count.projects,
      funnel_stage: deriveFunnelStage({
        projectCount: user._count.projects,
        planId,
        planStatus,
        completedTours: user.tourProgress?.completedTours,
      }),
      projects: user.projects.map((p) => ({
        id: p.id,
        projectName: p.projectName,
        updatedAt: p.updatedAt.toISOString(),
      })),
      transactions: user.transactions.map((t) => ({
        id: t.id,
        planId: t.planId,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      tickets: user.supportTickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt.toISOString(),
      })),
      feedback: user.feedbacks.map((f) => ({
        id: f.id,
        message: f.message,
        createdAt: f.createdAt.toISOString(),
      })),
      auditLogs: auditLogs.map((a) => ({
        id: a.id,
        action: a.action,
        actorEmail: a.actor?.email ?? null,
        createdAt: a.createdAt.toISOString(),
        meta: a.meta,
      })),
      loginEvents: user.loginEvents.map((e) => ({
        id: e.id,
        status: e.status,
        method: e.method,
        ip: e.ip,
        createdAt: e.createdAt.toISOString(),
      })),
      posthogPersonUrl: user.email
        ? posthogPersonSearchUrl(user.email)
        : null,
      posthogReplayUrl: posthogReplayHomeUrl(),
    };

    return { success: true, user: detail };
  } catch (error) {
    console.error("Error fetching admin user detail:", error);
    return { error: "Failed to fetch user detail" };
  }
}


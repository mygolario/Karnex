import prisma from "@/lib/prisma";
import { getUserSettings } from "@/lib/account/server";

export interface CreateNotificationInput {
  type: "info" | "success" | "warning" | "promo" | "achievement";
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  category?: string;
}

/**
 * Creates an in-app notification for a user, respecting their notification preferences.
 */
export async function createNotification(
  userId: string,
  input: CreateNotificationInput
) {
  try {
    // 1. Check user notification settings
    const settings = await getUserSettings(userId).catch(() => null);
    
    // Default to sending in-app notification if settings are missing or not fully configured
    let inAppEnabled = true;
    
    if (settings?.notifications) {
      const category = input.category || "product";
      const channelPrefs = settings.notifications.categories?.[category];
      if (channelPrefs && typeof channelPrefs.inApp !== "undefined") {
        inAppEnabled = channelPrefs.inApp;
      } else if (typeof settings.notifications.channels?.inApp !== "undefined") {
        inAppEnabled = settings.notifications.channels.inApp;
      }
    }

    if (!inAppEnabled) {
      console.log(`[Notifications] Skipping in-app notification for user ${userId} because it's disabled in settings.`);
      return null;
    }

    // 2. Create the notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        action: input.action ? (input.action as any) : undefined,
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Fetches the notifications list for a specific user.
 */
export async function getNotifications(userId: string) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Keep list to a reasonable size
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(userId: string, id: string) {
  try {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return null;
  }
}

/**
 * Marks all notifications for a specific user as read.
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return null;
  }
}

/**
 * Deletes a specific notification.
 */
export async function deleteNotification(userId: string, id: string) {
  try {
    return await prisma.notification.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return null;
  }
}

/**
 * Seeds initial welcome notifications for newly registered users.
 */
export async function seedWelcomeNotifications(userId: string) {
  try {
    const welcome = await prisma.notification.createMany({
      data: [
        {
          userId,
          type: "success",
          title: "به کارنکس خوش آمدید! 🎉",
          message: "از اینکه کارنکس را انتخاب کردید متشکریم. برای شروع، اولین پروژه و نقشه راه خود را ایجاد کنید.",
          action: { label: "داشبورد", href: "/dashboard/overview" } as any,
          read: false,
        },
        {
          userId,
          type: "info",
          title: "پروفایل خود را تکمیل کنید 👤",
          message: "اطلاعات حساب کاربری خود را در بخش تنظیمات تکمیل کنید تا تجربه بهتری داشته باشید.",
          action: { label: "تنظیمات حساب", href: "/dashboard/account" } as any,
          read: false,
        }
      ]
    });
    return welcome;
  } catch (error) {
    console.error("Failed to seed welcome notifications:", error);
    return null;
  }
}

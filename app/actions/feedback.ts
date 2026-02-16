"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitFeedback(message: string, userId?: string) {
  if (!message || message.trim().length === 0) {
    return { error: "Message is required" };
  }

  try {
    await prisma.feedback.create({
      data: {
        message,
        userId: userId || null,
      },
    });

    revalidatePath("/contact");
    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { error: "Failed to submit feedback" };
  }
}

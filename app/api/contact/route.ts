import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getContactAdminTemplate, getContactUserTemplate } from "@/lib/email-templates";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      subject,
      message,
      website,
      category = "general",
      priority = "medium",
      source,
    } = body;

    // Honeypot field — bots fill hidden inputs
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Basic Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "لطفاً تمام فیلدها را پر کنید." },
        { status: 400 },
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "آدرس ایمیل وارد شده معتبر نیست." },
        { status: 400 },
      );
    }

    const session = await auth();
    const ticketEmail =
      session?.user?.email && email === "support_in_app@karnex.ir"
        ? session.user.email
        : email;

    // Persist support ticket for admin inbox
    try {
      await prisma.supportTicket.create({
        data: {
          userId: session?.user?.id ?? null,
          email: ticketEmail,
          subject: String(subject).slice(0, 500),
          category: String(category).slice(0, 64),
          priority: String(priority).slice(0, 32),
          message: String(message),
          status: "open",
        },
      });
    } catch (ticketErr) {
      console.error("Failed to persist support ticket:", ticketErr);
    }

    // Email to Support Team (Forwarding) — best-effort when Resend configured
    const adminHtml = getContactAdminTemplate({
      name,
      email: ticketEmail,
      subject,
      message,
    });
    const supportEmailSuccess = await sendEmail({
      to: "support@karnex.ir",
      subject: `New Contact Form: ${subject}`,
      htmlContent: adminHtml,
      templateName: "contact",
      name: "Karnex Support Team",
      cc: process.env.ADMIN_CC_EMAIL,
    });

    // If email fails but ticket was saved, still succeed for in-app support
    if (!supportEmailSuccess && source !== "dashboard-support") {
      return NextResponse.json(
        { error: "خطا در ارسال پیام. لطفاً بعداً تلاش کنید." },
        { status: 500 },
      );
    }

    // Auto-reply to User (skip placeholder in-app email)
    if (emailRegex.test(ticketEmail) && !ticketEmail.includes("support_in_app@")) {
      const userHtml = getContactUserTemplate(name);
      await sendEmail({
        to: ticketEmail,
        subject: "دریافت پیام شما - کارنکس",
        htmlContent: userHtml,
        templateName: "welcome",
        name: name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "خطای سرور داخلی." }, { status: 500 });
  }
}

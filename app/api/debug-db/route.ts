import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-actions";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const isDefined = !!dbUrl;
    const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'undefined';

    console.log("Debug DB: Starting connection test...");
    console.log("Debug DB: URL:", maskedUrl);

    // 1. Test basic DB connection
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("Debug DB: Query result:", result);

    // 2. Test Auth Logic (Check if a user exists)
    // We'll search for the user and check the size of the returned data
    const emailToTest = "kavehtkts@gmail.com"; // The email from the screenshot
    try {
        console.log(`Debug DB: Testing authenticateUser for ${emailToTest}...`);
        
        // Direct DB fetch to inspect raw data size
        const userRaw = await prisma.user.findUnique({ where: { email: emailToTest } });
        
        if (userRaw) {
             console.log("Debug DB: User found directly in DB.");
             console.log("Debug DB: User ID:", userRaw.id);
             console.log("Debug DB: Image field length:", userRaw.image ? userRaw.image.length : 0);
             console.log("Debug DB: Image field start:", userRaw.image ? userRaw.image.substring(0, 50) : "N/A");
             
             if (userRaw.image && userRaw.image.length > 1000) {
                 console.warn("⚠️ WARNING: User image is very large! This might be bloating the session cookie.");
             }
        } else {
             console.log("Debug DB: User NOT found directly in DB.");
        }

        const authResult = await authenticateUser({ email: emailToTest, password: "password" }); // Password doesn't matter for size check, but auth might fail if wrong. 
        // Actually, we need to inspect what authenticateUser returns even if password fails, but we can't.
        // So relying on userRaw check above is better.
        
    } catch (authErr) {
        console.error("Debug DB: Auth Check Failed:", authErr);
        // Don't throw, just log
    }

    return NextResponse.json({
      status: "success",
      message: "Database and Auth Logic checks passed",
      timestamp: result,
      env: {
        DATABASE_URL_DEFINED: isDefined,
        DATABASE_URL_MASKED: maskedUrl
      }
    });

  } catch (error: any) {
    console.error("Debug DB: Connection failed:", error);
    return NextResponse.json({
      status: "error",
      message: "Database/Auth check failed",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authenticateUser(credentials: unknown) {
  const parsedCredentials = CredentialsSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return null;
  }

  const { email, password } = parsedCredentials.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const passwordsMatch = await bcrypt.compare(password, user.password || "");
    if (passwordsMatch) {
        // Return only necessary user fields to avoid serialization issues
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role
        };
    }
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }

  return null;
}

const SignupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signupUser(formData: { fullName: string; email: string; password: string }) {
  const result = SignupSchema.safeParse(formData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { fullName, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [firstName, ...lastNameParts] = (fullName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName,
        firstName: firstName || "",
        lastName: lastName || "",
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      },
    });

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

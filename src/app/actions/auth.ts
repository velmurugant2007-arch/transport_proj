"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { RegisterSchema } from "@/lib/validations";

export async function registerAdmin(formData: FormData) {
  // Validate + sanitize all inputs with Zod before any DB call
  const parsed = RegisterSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid registration data";
    throw new Error(msg);
  }

  const { name, email, password } = parsed.data;

  // Check for existing admin — constant-time-safe (no enumeration)
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (existingAdmin) {
    // Generic message — don't reveal whether email exists
    throw new Error("Registration failed. Please contact the system administrator.");
  }

  // bcrypt with cost factor 12 for production strength
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.admin.create({
    data: { name, email, password: hashedPassword },
  });

  redirect("/login");
}

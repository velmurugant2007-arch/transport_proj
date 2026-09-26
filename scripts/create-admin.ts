/**
 * TransitFlow ERP — Admin Creation Script
 * ─────────────────────────────────────────────────────────────
 * Usage:
 *   npx tsx scripts/create-admin.ts <name> <email> <password>
 *
 * Examples:
 *   npx tsx scripts/create-admin.ts "Varun"  "varun@college.edu"  "Varun@1234"
 *   npx tsx scripts/create-admin.ts "Yuva"   "yuva@college.edu"   "Yuva@5678"
 *   npx tsx scripts/create-admin.ts "Admin"  "admin@college.edu"  "Admin@1234"
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error("❌  Missing arguments.");
    console.error("    Usage: npx tsx scripts/create-admin.ts <name> <email> <password>");
    console.error('    Example: npx tsx scripts/create-admin.ts "Varun" "varun@college.edu" "Varun@1234"');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌  Password must be at least 6 characters.");
    process.exit(1);
  }

  console.log(`\n🔐  Creating admin account for "${name}"...`);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.error(`⚠️  An admin with email "${email}" already exists.`);
    console.error("    Use a different email or delete the existing record in Prisma Studio.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: { name, email, password: hashedPassword },
  });

  console.log("\n✅  Admin created successfully!");
  console.log("─────────────────────────────────────────");
  console.log(`   Name     : ${admin.name}`);
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Password : ${password}  (plain — save this securely)`);
  console.log(`   ID       : ${admin.id}`);
  console.log("─────────────────────────────────────────");
  console.log("   Login at : http://localhost:3000/login\n");
}

main()
  .catch((e) => {
    console.error("❌  Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

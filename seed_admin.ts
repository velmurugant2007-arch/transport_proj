import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password", 10);

  // Re-seed standard admin
  await prisma.admin.upsert({
    where: { email: "admin@psnacet.edu.in" },
    update: { password: hashedPassword, name: "System Admin" },
    create: {
      email: "admin@psnacet.edu.in",
      name: "System Admin",
      password: hashedPassword,
    },
  });

  // Re-seed velmurugan admin just in case
  await prisma.admin.upsert({
    where: { email: "velmurugan@psnacet.edu.in" },
    update: { password: hashedPassword, name: "velmurugan" },
    create: {
      email: "velmurugan@psnacet.edu.in",
      name: "velmurugan",
      password: hashedPassword,
    },
  });

  console.log("Admin users recreated successfully!");
  console.log("-----------------------------------");
  console.log("Email: admin@psnacet.edu.in");
  console.log("Password: password");
  console.log("-----------------------------------");
  console.log("Email: velmurugan@psnacet.edu.in");
  console.log("Password: password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

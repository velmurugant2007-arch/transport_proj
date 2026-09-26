import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Gets the current admin user from the session.
 * Used in server actions for automatic activity tracking.
 */
export async function getCurrentAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  return {
    id: session.user.id,
    name: session.user.name || "Unknown Admin",
    email: session.user.email,
  };
}

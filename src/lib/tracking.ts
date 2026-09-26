import { getCurrentAdmin } from "./auth-utils";

/**
 * Enterprise tracking utility for automatic admin activity logging.
 */
export async function withTracking(data: any, action: "create" | "update" | "delete") {
  const admin = await getCurrentAdmin();
  const adminName = admin?.name || "System";
  
  if (action === "create") {
    return {
      ...data,
      createdBy: adminName,
      updatedBy: adminName,
      deletedAt: null,
    };
  }
  
  if (action === "update") {
    return {
      ...data,
      updatedBy: adminName,
    };
  }
  
  if (action === "delete") {
    return {
      deletedAt: new Date(),
      deletedBy: adminName,
    };
  }
  
  return data;
}

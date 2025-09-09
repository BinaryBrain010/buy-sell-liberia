import ActivityLog from "@/models/ActivityLog";
import { Types } from "mongoose";

/**
 * Log an employee action
 * @param userId - Employee's user ID
 * @param action - Action string (e.g., 'approved_listing', 'handled_payment')
 * @param details - Optional details
 */
export async function logEmployeeAction(
  userId: string | Types.ObjectId,
  action: string,
  details?: string
) {
  await ActivityLog.create({
    user: userId,
    action,
    details: details || "",
    createdAt: new Date(),
  });
}

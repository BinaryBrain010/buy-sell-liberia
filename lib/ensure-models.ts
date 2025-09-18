/**
 * Ensure all models are registered with Mongoose
 * This prevents "Schema hasn't been registered" errors
 */

import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Chat from "@/models/Chat";
import Review from "@/models/Review";
import ManualPayment from "@/models/ManualPayment";
import Employee from "@/models/Employee";
import WithdrawalLog from "@/models/WithdrawalLog";

/**
 * Ensure all models are registered
 * Call this before any database operations
 */
export function ensureModelsRegistered() {
  // The act of importing the models registers them with Mongoose
  // This function serves as a central place to ensure all models are loaded
  return {
    User,
    ActivityLog,
    Product,
    Category,
    Chat,
    Review,
    ManualPayment,
    Employee,
    WithdrawalLog
  };
}

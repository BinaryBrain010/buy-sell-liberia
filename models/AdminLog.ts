import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminLog extends Document {
  // Admin/Employee who performed the action
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  
  // Action details
  action: string; // e.g., 'banned_user', 'approved_listing', 'toggled_monetization'
  module: string; // e.g., 'users', 'listings', 'payments', 'settings', 'categories'
  
  // Target details (what was acted upon)
  targetType?: string; // e.g., 'user', 'listing', 'payment', 'setting'
  targetId?: mongoose.Types.ObjectId;
  targetName?: string; // Human readable target name
  
  // Action context
  details: Record<string, any>; // Flexible details object
  description: string; // Human readable description
  
  // Request metadata
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    // Admin/Employee info
    adminId: {
      type: String, // Changed from ObjectId to String for flexibility
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    adminEmail: {
      type: String,
      required: true,
      index: true
    },
    adminRole: {
      type: String,
      required: true,
      index: true
    },
    
    // Action details
    action: {
      type: String,
      required: true,
      index: true
    },
    module: {
      type: String,
      required: true,
      index: true,
      enum: ['users', 'listings', 'payments', 'settings', 'categories', 'reports', 'admins']
    },
    
    // Target details
    targetType: {
      type: String,
      index: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      index: true
    },
    targetName: String,
    
    // Action context
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    description: {
      type: String,
      required: true
    },
    
    // Request metadata
    ipAddress: String,
    userAgent: String,
    
    // Timestamps
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    // Optimize for queries by timestamp desc
    collection: 'adminlogs'
  }
);

// Indexes for efficient querying
AdminLogSchema.index({ timestamp: -1 });
AdminLogSchema.index({ adminId: 1, timestamp: -1 });
AdminLogSchema.index({ module: 1, timestamp: -1 });
AdminLogSchema.index({ action: 1, timestamp: -1 });
AdminLogSchema.index({ targetType: 1, targetId: 1 });

// Virtual for formatted timestamp
AdminLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

const AdminLog = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);

export default AdminLog;

import mongoose, { Schema, Document } from 'mongoose';

export type AnnouncementType = 'banner' | 'email' | 'popup' | 'chat';
export type AnnouncementStatus = 'draft' | 'active' | 'scheduled' | 'expired' | 'sent';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: AnnouncementType[];
  status: AnnouncementStatus;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  expiresAt?: Date;
  targetAudience?: {
    roles?: string[];
    userIds?: mongoose.Types.ObjectId[];
  };
  sentAt?: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: [String], enum: ['banner', 'email', 'popup', 'chat'], required: true },
  status: { type: String, enum: ['draft', 'active', 'scheduled', 'expired', 'sent'], default: 'draft' },
  scheduledAt: { type: Date },
  expiresAt: { type: Date },
  targetAudience: {
    roles: [{ type: String }],
    userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  sentAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

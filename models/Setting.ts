import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, {
  timestamps: true
});

// Ensure mongoose.models exists before accessing it
let Setting: mongoose.Model<ISetting>;

if (mongoose.models && mongoose.models.Setting) {
  Setting = mongoose.models.Setting as mongoose.Model<ISetting>;
} else {
  Setting = mongoose.model<ISetting>('Setting', SettingSchema);
}

export default Setting;

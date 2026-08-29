import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar_url: { type: String },
  role: { type: String, enum: ['ADMIN', 'PM', 'MEMBER', 'VIEWER'], default: 'MEMBER' }
}, { timestamps: true });

export default models.User || mongoose.model('User', UserSchema);
import mongoose, { Schema, models } from 'mongoose';

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  budget: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'], default: 'ACTIVE' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['ADMIN', 'PM', 'MEMBER', 'VIEWER'], default: 'MEMBER' }
  }]
}, { timestamps: true });

export default models.Project || mongoose.model('Project', ProjectSchema);
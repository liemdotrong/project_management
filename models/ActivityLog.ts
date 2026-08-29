import mongoose, { Schema, models } from 'mongoose';

const ActivityLogSchema = new Schema({
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

import mongoose, { Schema, models } from 'mongoose';

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  column_id: { 
    type: String, 
    enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'], 
    default: 'TODO' 
  },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  priority: { type: String, enum: ['LOW', 'MED', 'HIGH', 'URGENT'], default: 'MED' },
  due_date: { type: Date },
  position: { type: Number, default: 0 },
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  budget: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default models.Task || mongoose.model('Task', TaskSchema);
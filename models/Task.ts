import mongoose, { Schema, models } from 'mongoose';

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['TODO', 'IN_PROGRESS', 'DONE'], 
    default: 'TODO' 
  },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  order: { type: Number, default: 0 } // Tùy chọn: dùng để lưu thứ tự khi kéo thả trong cùng 1 cột
}, { timestamps: true });

export default models.Task || mongoose.model('Task', TaskSchema);
import mongoose, { Schema, models } from 'mongoose';

const DocumentSchema = new Schema({
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  file_name: { type: String, required: true },
  file_url: { type: String, required: true },
  file_size: { type: Number, required: true },
  uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default models.Document || mongoose.model('Document', DocumentSchema);

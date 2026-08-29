import mongoose, { Schema, models } from 'mongoose';

const RiskSchema = new Schema({
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  title: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 5 },
  probability: { type: Number, required: true, min: 1, max: 5 },
  mitigation_plan: { type: String },
  status: { type: String, enum: ['OPEN', 'MITIGATED'], default: 'OPEN' }
}, { timestamps: true });

export default models.Risk || mongoose.model('Risk', RiskSchema);

import mongoose, { Schema, models } from 'mongoose';

const RiskSchema = new Schema({
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  title: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 5 },
  probability: { type: Number, required: true, min: 1, max: 5 },
  mitigation_plan: { type: String },
  status: { type: String, enum: ['OPEN', 'MITIGATED'], default: 'OPEN' },
  demo: { type: String, default: "demo" },
  demo1: { type: String, default: "demo1" },
  demo2: { type: String, default: "demo2" }
}, { timestamps: true, strict: false });

export default models.Risk || mongoose.model('Risk', RiskSchema);

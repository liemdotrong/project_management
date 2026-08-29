import mongoose, { Schema, models } from 'mongoose';

const OpportunitySchema = new Schema({
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  title: { type: String, required: true },
  impact_value: { type: Number, required: true },
  action_plan: { type: String },
  status: { type: String, enum: ['IDENTIFIED', 'REALIZED'], default: 'IDENTIFIED' }
}, { timestamps: true });

export default models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

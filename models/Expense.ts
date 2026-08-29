import mongoose, { Schema, models } from 'mongoose';

const ExpenseSchema = new Schema({
  task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  receipt_url: { type: String },
  spent_at: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.Expense || mongoose.model('Expense', ExpenseSchema);

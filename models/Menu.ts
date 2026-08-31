import mongoose, { Schema, models } from 'mongoose';

const MenuSchema = new Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  icon: { type: String, default: 'LayoutDashboard' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default models.Menu || mongoose.model('Menu', MenuSchema);

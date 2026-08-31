import mongoose, { Schema, models } from 'mongoose';

const RolePermissionSchema = new Schema({
  role: { type: String, required: true, enum: ['ADMIN', 'PM', 'MEMBER', 'VIEWER'] },
  menu_id: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  can_read: { type: Boolean, default: true },
  can_create: { type: Boolean, default: false },
  can_update: { type: Boolean, default: false },
  can_delete: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure a role can only have one permission set per menu
RolePermissionSchema.index({ role: 1, menu_id: 1 }, { unique: true });

export default models.RolePermission || mongoose.model('RolePermission', RolePermissionSchema);

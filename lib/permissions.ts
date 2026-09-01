export type Role = 'ADMIN' | 'PM' | 'MEMBER' | 'VIEWER';

export function canAccessAdmin(role: Role): boolean {
  return role === 'ADMIN';
}

export function getTaskPermissions(role: Role) {
  if (role === 'PM') {
    return { can_read: true, can_create: true, can_update: true, can_delete: true, can_move: true };
  }
  // Admin, Member, Viewer
  return { can_read: true, can_create: false, can_update: false, can_delete: false, can_move: false };
}

export function getSubTabPermissions(role: Role) {
  if (role === 'PM') {
    return { can_read: true, can_create: true, can_update: true, can_delete: true };
  }
  if (role === 'MEMBER') {
    // Members can add to Risk, Opportunity, Expenses, Documents
    return { can_read: true, can_create: true, can_update: false, can_delete: false };
  }
  // Admin, Viewer
  return { can_read: true, can_create: false, can_update: false, can_delete: false };
}


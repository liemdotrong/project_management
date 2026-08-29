export type Role = 'ADMIN' | 'PM' | 'MEMBER' | 'VIEWER';

export const Permissions = {
  CAN_EDIT_BOARD: ['ADMIN', 'PM'],
  CAN_MOVE_TASK: ['ADMIN', 'PM', 'MEMBER'], // For Member, we'll need to check if they are Assigned
  CAN_ADD_EXPENSE: ['ADMIN', 'PM', 'MEMBER'],
  CAN_ADD_RISK: ['ADMIN', 'PM', 'MEMBER'],
  CAN_VIEW_BOARD: ['ADMIN', 'PM', 'MEMBER', 'VIEWER'],
};

export function hasPermission(userRole: Role, action: keyof typeof Permissions) {
  if (!userRole) return false;
  return Permissions[action].includes(userRole);
}

// Special check for moving tasks (MEMBER can only move assigned tasks)
export function canMoveTask(userRole: Role, userId: string, taskAssignees: string[]) {
  if (userRole === 'ADMIN' || userRole === 'PM') return true;
  if (userRole === 'MEMBER' && taskAssignees.includes(userId)) return true;
  return false;
}

/**
 * RBAC – Frontend
 * أضف role جديد هنا فقط وسيتم تطبيقه تلقائياً في كل مكان
 */

export const ROLES = {
  ADMIN:   'admin',
  DOCTOR:  'doctor',
  PATIENT: 'patient',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ─── Permissions ─────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  USE_CHAT:              [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT],
  PREDICT_2D:            [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT],
  PREDICT_3D:            [ROLES.ADMIN, ROLES.DOCTOR],
  VIEW_RECORDS:          [ROLES.ADMIN, ROLES.DOCTOR],
  UPLOAD_RECORDS:        [ROLES.ADMIN, ROLES.DOCTOR],
  GENERATE_REPORTS:      [ROLES.ADMIN, ROLES.DOCTOR],
  MANAGE_KNOWLEDGE_BASE: [ROLES.ADMIN, ROLES.DOCTOR],
  MANAGE_USERS:          [ROLES.ADMIN],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const hasPermission = (
  role: UserRole | null | undefined,
  permission: Permission,
): boolean => {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
};

export const isValidRole = (role: string): role is UserRole =>
  Object.values(ROLES).includes(role as UserRole);

/** Mapping: صفحة → الـ roles المسموح لها */
export const ROUTE_ROLES: Record<string, readonly UserRole[]> = {
  '/chat':      PERMISSIONS.USE_CHAT,
  '/predict':   PERMISSIONS.PREDICT_2D,
  '/predict3d': PERMISSIONS.PREDICT_3D,
  '/records':   PERMISSIONS.VIEW_RECORDS,
  '/profile':   [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT],
};

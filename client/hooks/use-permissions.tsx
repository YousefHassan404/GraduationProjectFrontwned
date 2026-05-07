import { useAuth } from '../lib/auth-context';
import { hasPermission, PERMISSIONS, UserRole } from '../lib/roles';

/**
 * Hook للتحقق من صلاحيات المستخدم
 */
export function usePermissions() {
    const { user } = useAuth();

    /**
     * التحقق من صلاحية معينة
     */
    const checkPermission = (permission: keyof typeof PERMISSIONS): boolean => {
        return hasPermission(user?.role as UserRole, permission);
    };

    /**
     * التحقق من عدة صلاحيات (يجب أن تتوفر جميعها)
     */
    const checkAllPermissions = (permissions: (keyof typeof PERMISSIONS)[]): boolean => {
        return permissions.every(permission => checkPermission(permission));
    };

    /**
     * التحقق من عدة صلاحيات (يكفي توفر واحدة منها)
     */
    const checkAnyPermission = (permissions: (keyof typeof PERMISSIONS)[]): boolean => {
        return permissions.some(permission => checkPermission(permission));
    };

    /**
     * التحقق من الـ role مباشرة
     */
    const hasRole = (role: UserRole): boolean => {
        return user?.role === role;
    };

    /**
     * التحقق من عدة roles (يكفي توفر واحد منها)
     */
    const hasAnyRole = (roles: UserRole[]): boolean => {
        return roles.some(role => hasRole(role));
    };

    return {
        checkPermission,
        checkAllPermissions,
        checkAnyPermission,
        hasRole,
        hasAnyRole,
        userRole: user?.role as UserRole | null
    };
}

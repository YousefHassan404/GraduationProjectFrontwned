import { ReactNode } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { PERMISSIONS, UserRole } from '../lib/roles';

interface PermissionGateProps {
    children: ReactNode;
    requiredPermission?: keyof typeof PERMISSIONS;
    requiredRole?: UserRole;
    requiredRoles?: UserRole[];
    fallback?: ReactNode;
}

/**
 * مكون لإخفاء/إظهار العناصر بناءً على الصلاحيات
 * يستخدم داخل الصفحات لإخفاء أزرار أو أقسام معينة
 */
export function PermissionGate({
    children,
    requiredPermission,
    requiredRole,
    requiredRoles,
    fallback = null
}: PermissionGateProps) {
    const { checkPermission, hasRole, hasAnyRole } = usePermissions();

    // التحقق من الصلاحية المطلوبة
    if (requiredPermission && !checkPermission(requiredPermission)) {
        return <>{fallback}</>;
    }

    // التحقق من الـ Role المطلوب (واحد فقط)
    if (requiredRole && !hasRole(requiredRole)) {
        return <>{fallback}</>;
    }

    // التحقق من الـ Roles المطلوبة (واحد على الأقل)
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

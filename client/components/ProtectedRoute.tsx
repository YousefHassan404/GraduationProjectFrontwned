import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { hasPermission, Permission, UserRole } from '@/lib/roles';

interface Props {
    children: ReactNode;
    /** تحقق من صلاحية محددة */
    permission?: Permission;
    /** تحقق من role محدد */
    role?: UserRole;
    /** تحقق من أي role من القائمة */
    roles?: readonly UserRole[];
}

/**
 * ProtectedRoute
 *
 * - غير مسجّل → /login
 * - مسجّل لكن بدون صلاحية → /unauthorized
 * - مسجّل وعنده صلاحية → يعرض الصفحة
 */
export default function ProtectedRoute({ children, permission, role, roles }: Props) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // انتظار تحميل بيانات المستخدم
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // غير مسجّل
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRole = user?.role as UserRole;

    // تحقق من permission
    if (permission && !hasPermission(userRole, permission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // تحقق من role واحد
    if (role && userRole !== role) {
        return <Navigate to="/unauthorized" replace />;
    }

    // تحقق من قائمة roles
    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}

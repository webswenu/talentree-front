import { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../../utils/permissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  anyPermission?: Permission[];
  allPermissions?: Permission[];
  fallback?: ReactNode;
}

/**
 * Componente que controla el acceso basado en permisos
 */
export const PermissionGate = ({
  children,
  permission,
  anyPermission,
  allPermissions,
  fallback = null
}: PermissionGateProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(user.role, permission);
  } else if (anyPermission) {
    hasAccess = hasAnyPermission(user.role, anyPermission);
  } else if (allPermissions) {
    hasAccess = hasAllPermissions(user.role, allPermissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * HOC para proteger componentes con permisos
 */
export const withPermission = (
  Component: React.ComponentType<any>,
  permission: Permission | Permission[],
  fallback?: ReactNode
) => {
  return (props: any) => {
    const isArray = Array.isArray(permission);
    const permissionProps = isArray
      ? { anyPermission: permission as Permission[] }
      : { permission: permission as Permission };

    return (
      <PermissionGate {...permissionProps} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    );
  };
};

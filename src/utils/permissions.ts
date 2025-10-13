import { UserRole } from '../types/user.types';

// Definición de permisos del sistema
export enum Permission {
  // Empresas
  COMPANIES_VIEW = 'companies.view',
  COMPANIES_CREATE = 'companies.create',
  COMPANIES_EDIT = 'companies.edit',
  COMPANIES_DELETE = 'companies.delete',

  // Procesos
  PROCESSES_VIEW = 'processes.view',
  PROCESSES_CREATE = 'processes.create',
  PROCESSES_EDIT = 'processes.edit',
  PROCESSES_DELETE = 'processes.delete',
  PROCESSES_MANAGE = 'processes.manage',

  // Tests
  TESTS_VIEW = 'tests.view',
  TESTS_CREATE = 'tests.create',
  TESTS_EDIT = 'tests.edit',
  TESTS_DELETE = 'tests.delete',
  TESTS_REVIEW = 'tests.review',
  TESTS_TAKE = 'tests.take',

  // Trabajadores
  WORKERS_VIEW = 'workers.view',
  WORKERS_CREATE = 'workers.create',
  WORKERS_EDIT = 'workers.edit',
  WORKERS_DELETE = 'workers.delete',

  // Usuarios
  USERS_VIEW = 'users.view',
  USERS_CREATE = 'users.create',
  USERS_EDIT = 'users.edit',
  USERS_DELETE = 'users.delete',

  // Reportes
  REPORTS_VIEW = 'reports.view',
  REPORTS_CREATE = 'reports.create',
  REPORTS_DELETE = 'reports.delete',

  // Auditoría
  AUDIT_VIEW = 'audit.view',

  // Configuración
  SETTINGS_VIEW = 'settings.view',
  SETTINGS_EDIT = 'settings.edit'
}

// Mapa de permisos por rol
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN_TALENTREE]: [
    // Admin tiene todos los permisos
    Permission.COMPANIES_VIEW,
    Permission.COMPANIES_CREATE,
    Permission.COMPANIES_EDIT,
    Permission.COMPANIES_DELETE,
    Permission.PROCESSES_VIEW,
    Permission.PROCESSES_CREATE,
    Permission.PROCESSES_EDIT,
    Permission.PROCESSES_DELETE,
    Permission.PROCESSES_MANAGE,
    Permission.TESTS_VIEW,
    Permission.TESTS_CREATE,
    Permission.TESTS_EDIT,
    Permission.TESTS_DELETE,
    Permission.WORKERS_VIEW,
    Permission.WORKERS_CREATE,
    Permission.WORKERS_EDIT,
    Permission.WORKERS_DELETE,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_CREATE,
    Permission.REPORTS_DELETE,
    Permission.AUDIT_VIEW,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT
  ],

  [UserRole.COMPANY]: [
    Permission.PROCESSES_VIEW,
    Permission.WORKERS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW
  ],

  [UserRole.EVALUATOR]: [
    Permission.PROCESSES_VIEW,
    Permission.TESTS_VIEW,
    Permission.TESTS_REVIEW,
    Permission.WORKERS_VIEW,
    Permission.REPORTS_VIEW
  ],

  [UserRole.WORKER]: [
    Permission.PROCESSES_VIEW,
    Permission.TESTS_VIEW,
    Permission.TESTS_TAKE
  ],

  [UserRole.GUEST]: [
    Permission.PROCESSES_VIEW,
    Permission.REPORTS_VIEW
  ]
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) || false;
};

/**
 * Verifica si un rol tiene alguno de los permisos especificados
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

/**
 * Obtiene todos los permisos de un rol
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role] || [];
};

/**
 * Hook para verificar permisos en componentes
 */
export const usePermissions = (role: UserRole) => {
  return {
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    permissions: getRolePermissions(role)
  };
};

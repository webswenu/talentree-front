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
  REPORTS_EDIT = 'reports.edit',
  REPORTS_DELETE = 'reports.delete',
  REPORTS_APPROVE = 'reports.approve',

  // Auditoría
  AUDIT_VIEW = 'audit.view',

  // Configuración
  SETTINGS_VIEW = 'settings.view',
  SETTINGS_EDIT = 'settings.edit',

  // Aplicaciones (Worker)
  APPLICATIONS_CREATE = 'applications.create',
  APPLICATIONS_VIEW = 'applications.view',

  // Evaluación
  CANDIDATES_APPROVE = 'candidates.approve',
  CANDIDATES_REJECT = 'candidates.reject',

  // Invitaciones (Company)
  WORKERS_INVITE = 'workers.invite'
}

// Mapa de permisos por rol
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN_TALENTREE]: [
    // ✅ Admin tiene TODOS los permisos - CRUD completo
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
    Permission.TESTS_REVIEW,
    Permission.WORKERS_VIEW,
    Permission.WORKERS_CREATE,
    Permission.WORKERS_EDIT,
    Permission.WORKERS_DELETE,
    Permission.WORKERS_INVITE,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_CREATE,
    Permission.REPORTS_EDIT,
    Permission.REPORTS_DELETE,
    Permission.REPORTS_APPROVE,
    Permission.AUDIT_VIEW,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    Permission.CANDIDATES_APPROVE,
    Permission.CANDIDATES_REJECT,
    Permission.APPLICATIONS_VIEW,
    Permission.APPLICATIONS_CREATE
  ],

  [UserRole.COMPANY]: [
    // ✅ SOLO LECTURA de procesos y trabajadores + INVITAR trabajadores + VER REPORTES APROBADOS
    Permission.PROCESSES_VIEW,       // ✅ Ver procesos de su empresa
    Permission.WORKERS_VIEW,         // ✅ Ver trabajadores postulantes
    Permission.WORKERS_INVITE,       // ✅ Invitar trabajadores (único permiso de escritura)
    Permission.REPORTS_VIEW,         // ✅ Ver reportes aprobados (solo approved)
    Permission.SETTINGS_VIEW,        // ✅ Ver configuración
    Permission.SETTINGS_EDIT         // ✅ Editar configuración
    // ❌ NO puede: crear/editar/eliminar procesos
    // ❌ NO puede: crear/editar/aprobar reportes
  ],

  [UserRole.EVALUATOR]: [
    // ✅ Todo en modo LECTURA + REVISAR TESTS + EDITAR REPORTES (subir archivos, no aprobar)
    Permission.COMPANIES_VIEW,
    Permission.PROCESSES_VIEW,
    Permission.TESTS_VIEW,
    Permission.TESTS_REVIEW,         // ✅ Revisar/calificar tests
    Permission.WORKERS_VIEW,
    Permission.USERS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_CREATE,       // ✅ Crear reportes
    Permission.REPORTS_EDIT,         // ✅ Editar reportes (upload archivos)
    Permission.SETTINGS_VIEW,
    Permission.APPLICATIONS_VIEW
    // ❌ NO puede: aprobar reportes (solo Admin)
    // ❌ NO puede: auditoría (solo Admin)
  ],

  [UserRole.WORKER]: [
    // ✅ Ver procesos disponibles, postular, hacer tests, ver su estado
    Permission.PROCESSES_VIEW,        // ✅ Ver procesos disponibles
    Permission.TESTS_VIEW,            // ✅ Ver sus tests
    Permission.TESTS_TAKE,            // ✅ Realizar tests
    Permission.APPLICATIONS_CREATE,   // ✅ Postular a procesos
    Permission.APPLICATIONS_VIEW,     // ✅ Ver estado de sus aplicaciones
    Permission.SETTINGS_VIEW          // ✅ Ver configuración personal
  ],

  [UserRole.GUEST]: [
    // ✅ SOLO LECTURA - Igual que COMPANY pero SIN invitar
    Permission.PROCESSES_VIEW,        // ✅ Ver procesos de la empresa
    Permission.WORKERS_VIEW,          // ✅ Ver trabajadores postulantes
    Permission.REPORTS_VIEW,          // ✅ Ver reportes aprobados (igual que empresa)
    Permission.SETTINGS_VIEW          // ✅ Ver configuración (solo lectura)
    // ❌ NO puede: invitar trabajadores
    // ❌ NO puede: editar nada
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

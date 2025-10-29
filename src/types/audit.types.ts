import { User } from './user.types';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  user?: User;
  createdAt: Date;
}

export interface AuditFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  recentActivity: AuditLog[];
}

export const AuditActionLabels: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Crear',
  [AuditAction.READ]: 'Leer',
  [AuditAction.UPDATE]: 'Actualizar',
  [AuditAction.DELETE]: 'Eliminar',
  [AuditAction.LOGIN]: 'Iniciar Sesión',
  [AuditAction.LOGOUT]: 'Cerrar Sesión',
  [AuditAction.EXPORT]: 'Exportar',
  [AuditAction.IMPORT]: 'Importar',
};

export const AuditActionColors: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'bg-green-100 text-green-800',
  [AuditAction.READ]: 'bg-blue-100 text-blue-800',
  [AuditAction.UPDATE]: 'bg-yellow-100 text-yellow-800',
  [AuditAction.DELETE]: 'bg-red-100 text-red-800',
  [AuditAction.LOGIN]: 'bg-purple-100 text-purple-800',
  [AuditAction.LOGOUT]: 'bg-gray-100 text-gray-800',
  [AuditAction.EXPORT]: 'bg-indigo-100 text-indigo-800',
  [AuditAction.IMPORT]: 'bg-pink-100 text-pink-800',
};

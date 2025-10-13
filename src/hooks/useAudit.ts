import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import { AuditFilters } from '../types/audit.types';

export const auditKeys = {
  all: ['audit'] as const,
  lists: (filters?: AuditFilters) => [...auditKeys.all, 'list', filters] as const,
  byUser: (userId: string) => [...auditKeys.all, 'user', userId] as const,
  byEntity: (entityType: string, entityId: string) => [...auditKeys.all, 'entity', entityType, entityId] as const,
  stats: () => [...auditKeys.all, 'stats'] as const,
};

export const useAuditLogs = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: auditKeys.lists(filters),
    queryFn: () => auditService.findAll(filters),
  });
};

export const useAuditLogsByUser = (userId: string) => {
  return useQuery({
    queryKey: auditKeys.byUser(userId),
    queryFn: () => auditService.findByUser(userId),
    enabled: !!userId,
  });
};

export const useAuditLogsByEntity = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: auditKeys.byEntity(entityType, entityId),
    queryFn: () => auditService.findByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: auditKeys.stats(),
    queryFn: () => auditService.getStats(),
  });
};
